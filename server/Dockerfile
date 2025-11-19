FROM python:3.11-slim

WORKDIR /app

# Install Flask and Flask-CORS
RUN pip install --no-cache-dir flask flask-cors

# Copy server code
COPY . .

# Create data directory for database
RUN mkdir -p /app/data

# Modify app.py to bind to 0.0.0.0:5000
RUN sed -i 's/app.run()/app.run(host="0.0.0.0", port=5000, debug=False)/g' app.py

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
