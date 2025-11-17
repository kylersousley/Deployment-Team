#!/bin/bash

# Deployment Setup Script for Rollercoaster App
# This script creates all necessary Docker and Kubernetes files

set -e  # Exit on any error

echo "🎢 Rollercoaster App - Kubernetes Deployment Setup"
echo "=================================================="
echo ""

# Prompt for Docker Hub username
read -p "Enter your Docker Hub username: " DOCKER_USERNAME

if [ -z "$DOCKER_USERNAME" ]; then
    echo "❌ Error: Docker Hub username is required"
    exit 1
fi

echo ""
echo "📦 Creating deployment files..."
echo ""

# Create k8s directory
mkdir -p k8s

# Create Frontend Dockerfile in root
cat > Dockerfile.frontend << 'EOF'
FROM nginx:alpine

# Copy all client files and icons to nginx html directory
COPY client/ /usr/share/nginx/html/
COPY icons/ /usr/share/nginx/html/icons/

# Replace localhost:5000 with empty string in app.js for relative paths
RUN sed -i 's|http://localhost:5000||g' /usr/share/nginx/html/app.js

# Also fix the icon paths from relative to absolute
RUN sed -i "s|'../icons/|'/icons/|g" /usr/share/nginx/html/app.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

echo "✅ Created Dockerfile.frontend"

# Create Backend Dockerfile in server/
cat > server/Dockerfile << 'EOF'
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
EOF

echo "✅ Created server/Dockerfile"

# Create namespace.yaml
cat > k8s/namespace.yaml << 'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: rollercoaster-app
EOF

echo "✅ Created k8s/namespace.yaml"

# Create backend-deployment.yaml
cat > k8s/backend-deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: rollercoaster-app
spec:
  replicas: 1  # Backend should only have 1 replica due to SQLite
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ${DOCKER_USERNAME}/rollercoaster-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
        volumeMounts:
        - name: db-storage
          mountPath: /app/data
      volumes:
      - name: db-storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: rollercoaster-app
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: ClusterIP
EOF

echo "✅ Created k8s/backend-deployment.yaml"

# Create frontend-deployment.yaml
cat > k8s/frontend-deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: rollercoaster-app
spec:
  replicas: 3  # Frontend can scale horizontally
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ${DOCKER_USERNAME}/rollercoaster-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: rollercoaster-app
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
EOF

echo "✅ Created k8s/frontend-deployment.yaml"

# Create ingress.yaml
cat > k8s/ingress.yaml << 'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rollercoaster-ingress
  namespace: rollercoaster-app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /rollercoasters(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: backend-service
            port:
              number: 5000
      - path: /()(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: frontend-service
            port:
              number: 80
EOF

echo "✅ Created k8s/ingress.yaml"

# Create build and deploy script
cat > deploy.sh << EOF
#!/bin/bash

set -e

echo "🔨 Building and pushing Docker images..."
echo ""

# Build and push backend
echo "Building backend..."
cd server
docker build -t ${DOCKER_USERNAME}/rollercoaster-backend:latest .
echo "Pushing backend..."
docker push ${DOCKER_USERNAME}/rollercoaster-backend:latest
cd ..

# Build and push frontend
echo "Building frontend..."
docker build -f Dockerfile.frontend -t ${DOCKER_USERNAME}/rollercoaster-frontend:latest .
echo "Pushing frontend..."
docker push ${DOCKER_USERNAME}/rollercoaster-frontend:latest

echo ""
echo "✅ Docker images built and pushed!"
echo ""
echo "🚀 Deploying to Kubernetes..."
echo ""

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

echo ""
echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n rollercoaster-app --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend -n rollercoaster-app --timeout=120s

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n rollercoaster-app
echo ""
kubectl get svc -n rollercoaster-app
echo ""
echo "🌐 Ingress Information:"
kubectl get ingress -n rollercoaster-app
echo ""
echo "To get the application URL, run:"
echo "  kubectl get ingress -n rollercoaster-app"
EOF

chmod +x deploy.sh

echo "✅ Created deploy.sh"

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo ""
echo "📝 Files created:"
echo "  - Dockerfile.frontend (root)"
echo "  - server/Dockerfile"
echo "  - k8s/namespace.yaml"
echo "  - k8s/backend-deployment.yaml"
echo "  - k8s/frontend-deployment.yaml"
echo "  - k8s/ingress.yaml"
echo "  - deploy.sh"
echo ""
echo "🚀 Next steps:"
echo "  1. Make sure you're logged into Docker Hub: docker login"
echo "  2. Make sure NGINX Ingress Controller is installed in your cluster"
echo "  3. Run: ./deploy.sh"
echo ""