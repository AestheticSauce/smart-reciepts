import os
import time
import json  
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) 

# 2. Configure AWS Clients
# Note: We use the Session Token for both clients because you are in Learner Lab
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv('AWS_REGION')
)

textract = boto3.client(
    "textract",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name="us-east-1"
)
dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name="us-east-1"
)
TABLE_NAME = "Receipts"

BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
def init_db():
    try:
        # Check if table exists
        table = dynamodb.Table(TABLE_NAME)
        table.load()
        print(f" Found DynamoDB Table: {TABLE_NAME}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print(f"Table {TABLE_NAME} not found. Creating it...")
            # Create the table
            table = dynamodb.create_table(
                TableName=TABLE_NAME,
                KeySchema=[
                    {'AttributeName': 'id', 'KeyType': 'HASH'} # Partition Key (Unique ID)
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'id', 'AttributeType': 'S'} # S = String
                ],
                ProvisionedThroughput={
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            )
            # Wait until the table exists.
            table.wait_until_exists()
            print(f" Created DynamoDB Table: {TABLE_NAME}")
        else:
            print(f" Database Error: {e}")

# Run this check immediately when server starts
init_db()
table = dynamodb.Table(TABLE_NAME) # Get reference to the table
@app.route('/generate-upload-url', methods=['GET'])
def generate_upload_url():
    """
    Generates a secure, temporary URL that the frontend can use 
    to upload a file directly to S3.
    """
    try:
        file_name = request.args.get('fileName')
        file_type = request.args.get('fileType')

        if not file_name or not file_type:
            return jsonify({'error': 'Missing fileName or fileType'}), 400

        # Create a unique filename
        object_name = f"receipts/{int(time.time())}-{file_name}"

        # Generate Presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': object_name,
                'ContentType': file_type,
            },
            ExpiresIn=60
        )

        view_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{object_name}"

        return jsonify({
            'uploadUrl': presigned_url,
            'viewUrl': view_url,
            'key': object_name  # <--- CRITICAL FIX: We return the 'key' so Frontend can send it to Textract
        })

    except ClientError as e:
        print(f"AWS Error: {e}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500


@app.route('/receipts', methods=['GET'])
def get_receipts():
    try:
        # Scan the database (get everything)
        response = table.scan()
        items = response.get('Items', [])

        # Sort by timestamp (Newest first)
        # We use 'get' with a default of 0 just in case a row is missing the timestamp
        sorted_items = sorted(items, key=lambda x: int(x.get('timestamp', 0)), reverse=True)
        
        # Refresh URLs (since presigned URLs expire)
        # Note: In a production app, we would only refresh if expired, but this is fine for now.
        for item in sorted_items:
            item['url'] = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': item['id']},
                ExpiresIn=3600
            )

        return jsonify(sorted_items)

    except Exception as e:
        print("Database Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_receipt():
    try:
        data = request.json
        filename = data.get('fileName') # This is our unique Key (e.g. "receipts/123.jpg")
        
        print(f"Analyzing: {filename}")

        # 1. Call AWS Textract
        response = textract.analyze_expense(
            Document={'S3Object': {'Bucket': BUCKET_NAME, 'Name': filename}}
        )

        # 2. Extract Data
        store_name = "Unknown Store"
        total_amount = "---"
        date_str = "Unknown Date"

        for doc in response.get('ExpenseDocuments', []):
            for field in doc.get('SummaryFields', []):
                type_ = field.get('Type', {}).get('Text')
                value = field.get('ValueDetection', {}).get('Text')

                if type_ == 'VENDOR_NAME':
                    store_name = value
                elif type_ == 'TOTAL':
                    total_amount = value
                elif type_ == 'INVOICE_RECEIPT_DATE':
                    date_str = value
        
        # 3. Generate View URL (for the frontend to display later)
        view_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': filename},
            ExpiresIn=3600
        )

        # 4. SAVE TO DYNAMODB (The New Part!)
        item = {
            'id': filename,         # PRIMARY KEY
            'store': store_name,
            'total': total_amount,
            'date': date_str,
            'url': view_url,        # Save URL so we don't have to regenerate it constantly
            'timestamp': int(time.time()) # Current time for sorting
        }

        table.put_item(Item=item)
        
        print(f"Saved to DB: {item}")
        return jsonify(item)

    except Exception as e:
        print("AI Error:", e)
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(port=5000, debug=True)