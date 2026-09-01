import os
import subprocess
import sys

# Run database migrations before starting the server.
os.chdir(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)

import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        workers=1,
    )
