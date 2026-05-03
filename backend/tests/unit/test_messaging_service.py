import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, AuthProvider
from app.models.listing import Listing, ListingStatus, Transmission, Condition
from app.services.messaging_service import (
    create_conversation,
    get_conversations,
    get_conversation_messages,
    save_message,
    mark_messages_read,
)


async def _create_user(db: AsyncSession, email: str = "buyer@test.com") -> User:
    user = User(
        id=uuid.uuid4().bytes,
        email=email,
        display_name=email.split("@")[0],
        auth_provider=AuthProvider.email,
        password_hash="$2b$12$fakehashnotforproduction",
    )
    db.add(user)
    await db.flush()
    return user


async def _create_listing(db: AsyncSession, seller_id: bytes) -> Listing:
    listing = Listing(
        id=uuid.uuid4().bytes,
        seller_id=seller_id,
        make="Toyota",
        model="Camry",
        year=2020,
        price=500000,
        transmission=Transmission.automatic,
        condition=Condition.used,
        district="Cairo",
        status=ListingStatus.published,
    )
    db.add(listing)
    await db.flush()
    return listing


@pytest.mark.asyncio
async def test_create_conversation(db_session):
    buyer = await _create_user(db_session, "buyer1@test.com")
    seller = await _create_user(db_session, "seller1@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Hi, is this available?")
    assert conv is not None
    assert uuid.UUID(bytes=conv.buyer_id).hex == buyer_id
    assert uuid.UUID(bytes=conv.seller_id).hex == uuid.UUID(bytes=seller.id).hex
    assert uuid.UUID(bytes=conv.listing_id).hex == listing_id

    # Check initial message was created
    messages, total = await get_conversation_messages(db_session, uuid.UUID(bytes=conv.id).hex)
    assert total == 1
    assert messages[0].text_content == "Hi, is this available?"


@pytest.mark.asyncio
async def test_create_conversation_duplicate_returns_existing(db_session):
    buyer = await _create_user(db_session, "buyer2@test.com")
    seller = await _create_user(db_session, "seller2@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv1 = await create_conversation(db_session, buyer_id, listing_id, "First message")
    conv2 = await create_conversation(db_session, buyer_id, listing_id, "Second message")
    assert conv1.id == conv2.id


@pytest.mark.asyncio
async def test_get_conversations_for_user(db_session):
    buyer = await _create_user(db_session, "buyer3@test.com")
    seller = await _create_user(db_session, "seller3@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    await create_conversation(db_session, buyer_id, listing_id, "Hello")

    convs, total = await get_conversations(db_session, buyer_id)
    assert total == 1
    assert len(convs) == 1

    # Seller should also see the conversation
    seller_id = uuid.UUID(bytes=seller.id).hex
    convs2, total2 = await get_conversations(db_session, seller_id)
    assert total2 == 1


@pytest.mark.asyncio
async def test_save_text_message(db_session):
    buyer = await _create_user(db_session, "buyer4@test.com")
    seller = await _create_user(db_session, "seller4@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "First")
    conv_id = uuid.UUID(bytes=conv.id).hex

    msg = await save_message(db_session, conv_id, buyer_id, "text", text_content="Second message")
    assert msg.text_content == "Second message"
    assert msg.content_type.value == "text"

    messages, total = await get_conversation_messages(db_session, conv_id)
    assert total == 2


@pytest.mark.asyncio
async def test_save_image_message(db_session):
    buyer = await _create_user(db_session, "buyer5@test.com")
    seller = await _create_user(db_session, "seller5@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Hi")
    conv_id = uuid.UUID(bytes=conv.id).hex

    file_data = b"\x89PNG\r\n\x1a\nfake-image-data"
    msg = await save_message(
        db_session, conv_id, buyer_id, "image",
        file_data=file_data, file_subdir="voice_notes",
    )
    assert msg.content_type.value == "image"
    assert msg.file_url is not None


@pytest.mark.asyncio
async def test_save_voice_note_message(db_session):
    buyer = await _create_user(db_session, "buyer6@test.com")
    seller = await _create_user(db_session, "seller6@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Hi")
    conv_id = uuid.UUID(bytes=conv.id).hex

    file_data = b"fake-audio-data"
    waveform = [0.1, 0.5, 0.3, 0.8, 0.2]
    msg = await save_message(
        db_session, conv_id, buyer_id, "voice_note",
        file_data=file_data, file_subdir="voice_notes",
        file_duration_sec=15, file_waveform=waveform,
    )
    assert msg.content_type.value == "voice_note"
    assert msg.file_url is not None
    assert msg.file_duration_sec == 15
    assert msg.file_waveform == waveform


@pytest.mark.asyncio
async def test_mark_messages_read(db_session):
    buyer = await _create_user(db_session, "buyer7@test.com")
    seller = await _create_user(db_session, "seller7@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Message from buyer")
    conv_id = uuid.UUID(bytes=conv.id).hex

    # Buyer sends a message
    await save_message(db_session, conv_id, buyer_id, "text", text_content="Another buyer msg")

    # Seller marks messages as read
    count = await mark_messages_read(db_session, conv_id, seller_id)
    assert count >= 1

    # Marking again should return 0 (all already read)
    count2 = await mark_messages_read(db_session, conv_id, seller_id)
    assert count2 == 0


@pytest.mark.asyncio
async def test_get_conversation_messages_pagination(db_session):
    buyer = await _create_user(db_session, "buyer8@test.com")
    seller = await _create_user(db_session, "seller8@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Msg 1")
    conv_id = uuid.UUID(bytes=conv.id).hex

    # Add more messages
    for i in range(3):
        await save_message(db_session, conv_id, buyer_id, "text", text_content=f"Msg {i + 2}")

    messages, total = await get_conversation_messages(db_session, conv_id, page=1, limit=2)
    assert total == 4
    assert len(messages) == 2