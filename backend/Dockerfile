# backend/Dockerfile

FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make the startup script executable
RUN chmod +x start.sh

# Expose the correct port for Hugging Face
EXPOSE 7860

# This is the PRODUCTION command
CMD ["./start.sh"]