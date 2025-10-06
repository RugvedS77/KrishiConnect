# routers/community.py
import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, Form, HTTPException, Request, status
from schemas.all_schema import TokenData, ForumPostSummaryResponse, ReplyCreate, PostDetailResponse # Or wherever your schemas are
from auth import oauth2

# Import our database and model files
from database.postgresConn import get_db
from sqlalchemy.orm import Session, joinedload, selectinload
from models.all_model import User, ForumPost, ForumReply

# Create a new FastAPI router
router = APIRouter(
    prefix="/api/forum",
    tags=["Community"]
)

# --- NEW FORUM ENDPOINTS ---

# 1. Get All Posts (with Search and Category Filter)
@router.get("/posts", response_model=List[ForumPostSummaryResponse] )
def get_all_posts(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    q: Optional[str] = None,
    current_user: TokenData = Depends(oauth2.get_current_user),
):
    # Use options() with selectinload and joinedload to fetch everything efficiently
    query = db.query(ForumPost).options(
        selectinload(ForumPost.replies), # Use selectinload for one-to-many relationships
        joinedload(ForumPost.author)     # Use joinedload for many-to-one relationships
    )

    if category:
        query = query.filter(ForumPost.category == category)
    if q:
        query = query.filter(ForumPost.title.ilike(f"%{q}%"))
    
    posts = query.all()
    # Now, just add the reply_count attribute and return the SQLAlchemy objects directly!
    for post in posts:
        post.reply_count = len(post.replies)
        
    return posts


# 2. Get a Single Post (with Replies)
@router.get("/posts/{post_id}" , response_model=PostDetailResponse)
def get_single_post(post_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user),):
    # post = session.get(ForumPost, post_id)

    post = db.query(ForumPost).options(
        joinedload(ForumPost.author),
        joinedload(ForumPost.replies).joinedload(ForumReply.author)
    ).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    post.reply_count = len(post.replies)
    # Sort replies in Python
    post.replies.sort(key=lambda r: r.created_at)

    return post

# 3. Create a New Post (with Image Upload)
@router.post("/posts")
async def create_post(
    request: Request,
    db: Session = Depends(get_db),
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    print("Auth header:", request.headers.get("authorization"))
    print("Current user:", current_user)
    image_url = None
    # if image:
    #     # Generate a unique filename to prevent conflicts
    #     file_ext = image.filename.split('.')[-1]
    #     file_name = f"{uuid.uuid4()}.{file_ext}"
        
    #     try:
    #         # Upload to Supabase Storage in the 'forum-images' bucket
    #         supabase.storage.from_("forum-images").upload(file=image.file.read(), path=file_name, file_options={"content-type": image.content_type})
    #         # Get the public URL
    #         image_url = supabase.storage.from_("forum-images").get_public_url(file_name)
    #     except Exception as e:
    #         raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
        
    # author = session.get(User, user_id)
    author = db.query(User).filter(User.email == current_user.username).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    new_post = ForumPost(
        title=title, 
        content=content, 
        category=category, 
        author_id=author.id,
        image_url=image_url
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return {"message": "Post created successfully", "post_id": new_post.id}


# 4. Create a New Reply
@router.post("/posts/{post_id}/replies")
def create_reply(
    post_id: int,
    request: ReplyCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user),
):
    # post = session.get(ForumPost, post_id)
    post = db.query(ForumPost).filter(ForumPost.id == post_id ).first()
    author = db.query(User).filter(User.email == current_user.username).first()
    if not post or not author:
        raise HTTPException(status_code=404, detail="Post or Author not found")
    
    if post.author_id == author.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Users cannot reply to their own posts."
        )

    new_reply = ForumReply(
        content=request.content,
        post_id=post_id,
        author_id=author.id
    )
    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    return {"message": "Reply added successfully", "reply_id": new_reply.id}