# Deploying CreatorVault Backend on Hugging Face Spaces

This guide explains how to deploy the CreatorVault backend on Hugging Face Spaces using Docker.

## Prerequisites

1. A Hugging Face account
2. Your CreatorVault backend code
3. Dockerfile and docker-compose.yml (provided in this repository)

## Deployment Steps

### Option 1: Direct Docker Deployment on Hugging Face Spaces

1. **Create a new Space** on Hugging Face:
   - Go to your Hugging Face profile
   - Click "New Space"
   - Choose "Docker" as the SDK
   - Select "GPU" or "CPU" type (CPU is sufficient for a backend API)
   - Set the Space to "Public" or "Private" as needed

2. **Prepare your repository**:
   - Push your backend code (including Dockerfile and docker-compose.yml) to a GitHub repository
   - Make sure the repository is accessible

3. **Configure the Space**:
   - In your Space settings, link your GitHub repository
   - Make sure the Dockerfile is in the root of your project or specify the correct path

4. **Set Environment Variables**:
   - In your Space's "Files" tab, create a `.env` file with required environment variables:
     ```
     DATABASE_URL=postgresql+asyncpg://user:password@host:port/database
     BETTER_AUTH_SECRET=your_better_auth_secret
     ALLOWED_ORIGINS=https://your-frontend-url.com
     LOG_LEVEL=INFO
     ```

### Option 2: Using Hugging Face Inference API (Alternative)

If you prefer a simpler approach, you can also deploy as an Inference API:

1. Create a `requirements.txt` file from your dependencies:
   ```bash
   # Create requirements.txt from pyproject.toml
   uv pip compile pyproject.toml --output-file requirements.txt
   ```

2. Create an `app.py` file with the FastAPI application
3. Add a `Dockerfile` that uses the Hugging Face Inference API base image

## Environment Variables Required

Your deployment will need the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql+asyncpg://user:password@host:port/database`)
- `BETTER_AUTH_SECRET`: Secret key for Better Auth JWT verification
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `PORT`: Port number (default: 8000)

## Database Configuration

For production deployment, you'll need a PostgreSQL database. Since you're using Neon PostgreSQL:

1. **Set up your Neon database**:
   - Create a project in your Neon dashboard
   - Get the connection string from the "Connection Details" section
   - The connection string will look like: `postgresql://username:password@ep-xxxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require`

2. **Configure the DATABASE_URL environment variable** with your Neon connection string

## Scaling Considerations

- For production use, consider using a managed PostgreSQL service
- Implement connection pooling for database connections
- Set up proper logging and monitoring
- Use Redis for caching if needed

## Health Checks

The backend includes a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "0.1.0"
}
```

## API Documentation

Once deployed, API documentation will be available at:
- Swagger UI: `https://[your-space-name].hf.space/docs`
- ReDoc: `https://[your-space-name].hf.space/redoc`

## Troubleshooting

1. **Container won't start**: Check that all required environment variables are set
2. **Database connection issues**: Verify your DATABASE_URL format and network access
3. **CORS errors**: Ensure ALLOWED_ORIGINS includes your frontend URL
4. **Memory issues**: Increase Space resources if needed

## Security Best Practices

- Never commit secrets to the repository
- Use strong, unique values for BETTER_AUTH_SECRET
- Regularly rotate secrets
- Monitor access logs
- Use HTTPS for all connections