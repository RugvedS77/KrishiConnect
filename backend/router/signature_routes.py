import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Query
from auth import oauth2 # Your existing oauth2 logic
from schemas.all_schema import TokenData # Your existing TokenData schema
from database.supabase_client import supabase

router = APIRouter(
    prefix="/api/signatures",
    tags=["Signatures"]
)

SIGNATURE_BUCKET = "signatures" # The name of your bucket in Supabase

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_signature(
    file: UploadFile = File(...),
    role: str = Query(..., enum=["buyer", "farmer"]),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images are allowed."
        )

    try:
        contents = await file.read()
        file_extension = file.filename.split('.')[-1]
        # Use the username (email) from the token to create the path
        # This assumes your get_current_user returns a TokenData object with a 'username' field
        user_identifier = current_user.username.split('@')[0] # Example: make path from email
        if role == "farmer":
            folder_name = "farmer signatures"
        else:
            folder_name = "buyer signatures"

        file_path = f"{folder_name}/{user_identifier}/{uuid.uuid4()}.{file_extension}"

        supabase.storage.from_(SIGNATURE_BUCKET).upload(
            file=contents,
            path=file_path,
            file_options={"content-type": file.content_type}
        )
        
        public_url = supabase.storage.from_(SIGNATURE_BUCKET).get_public_url(file_path)
        return {"url": public_url}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not upload file: {str(e)}"
        )