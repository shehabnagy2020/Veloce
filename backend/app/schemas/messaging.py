from pydantic import BaseModel


class ConversationCreate(BaseModel):
    listing_id: str
    message: str


class ConversationResponse(BaseModel):
    id: str
    listing_id: str
    buyer_id: str
    seller_id: str
    listing_title: str | None = None
    other_user_name: str | None = None
    last_message: str | None = None
    unread_count: int = 0
    updated_at: str

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content_type: str = "text"
    text_content: str | None = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content_type: str
    text_content: str | None = None
    file_url: str | None = None
    file_duration_sec: int | None = None
    read_at: str | None = None
    created_at: str

    model_config = {"from_attributes": True}