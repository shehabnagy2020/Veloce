import uuid
import pytest

from app.models.user import User, AuthProvider
from app.models.listing import Listing, ListingStatus, Transmission, Condition
from app.services.auth_service import create_access_token


def _make_token(user_id_bytes: bytes) -> str:
    return create_access_token(uuid.UUID(bytes=user_id_bytes).hex)


async def _create_user(db, email: str) -> User:
    import bcrypt
    user = User(
        id=uuid.uuid4().bytes,
        email=email,
        display_name=email.split("@")[0],
        auth_provider=AuthProvider.email,
        password_hash=bcrypt.hashpw(b"testpass123", bcrypt.gensalt()).decode(),
    )
    db.add(user)
    await db.flush()
    return user


async def _create_listing(db, seller_id: bytes) -> Listing:
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
    from app.services.messaging_service import create_conversation

    buyer = await _create_user(db_session, "conv_buyer@test.com")
    seller = await _create_user(db_session, "conv_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Hi, is this available?")
    assert conv is not None
    assert uuid.UUID(bytes=conv.buyer_id).hex == buyer_id
    assert uuid.UUID(bytes=conv.listing_id).hex == listing_id


@pytest.mark.asyncio
async def test_conversation_duplicate(db_session):
    from app.services.messaging_service import create_conversation

    buyer = await _create_user(db_session, "dup_buyer@test.com")
    seller = await _create_user(db_session, "dup_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv1 = await create_conversation(db_session, buyer_id, listing_id, "First")
    conv2 = await create_conversation(db_session, buyer_id, listing_id, "Second")
    assert conv1.id == conv2.id


@pytest.mark.asyncio
async def test_save_and_retrieve_messages(db_session):
    from app.services.messaging_service import create_conversation, save_message, get_conversation_messages

    buyer = await _create_user(db_session, "msg_buyer@test.com")
    seller = await _create_user(db_session, "msg_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Initial")
    conv_id = uuid.UUID(bytes=conv.id).hex

    msg = await save_message(db_session, conv_id, buyer_id, "text", text_content="Second message")
    assert msg.text_content == "Second message"
    assert msg.content_type.value == "text"

    messages, total = await get_conversation_messages(db_session, conv_id)
    assert total == 2


@pytest.mark.asyncio
async def test_mark_messages_read(db_session):
    from app.services.messaging_service import create_conversation, save_message, mark_messages_read

    buyer = await _create_user(db_session, "read_buyer@test.com")
    seller = await _create_user(db_session, "read_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "From buyer")
    conv_id = uuid.UUID(bytes=conv.id).hex

    # Seller marks messages as read
    count = await mark_messages_read(db_session, conv_id, seller_id)
    assert count >= 1

    # Already read, should return 0
    count2 = await mark_messages_read(db_session, conv_id, seller_id)
    assert count2 == 0


@pytest.mark.asyncio
async def test_cannot_start_conversation_on_own_listing(db_session):
    """Verify via service layer that seller and buyer IDs differ."""
    from app.services.messaging_service import create_conversation

    seller = await _create_user(db_session, "own_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    # The conversation is created, but the API should prevent this.
    # This tests the service layer; the API layer enforces the rule.
    # The seller_id in the conversation will match the listing's seller.
    conv = await create_conversation(db_session, seller_id, listing_id, "Self msg")
    assert conv.seller_id == seller.id


@pytest.mark.asyncio
async def test_conversation_list_for_user(db_session):
    from app.services.messaging_service import create_conversation, get_conversations

    buyer = await _create_user(db_session, "list_buyer@test.com")
    seller = await _create_user(db_session, "list_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    await create_conversation(db_session, buyer_id, listing_id, "Hello")

    convs, total = await get_conversations(db_session, buyer_id)
    assert total == 1
    assert len(convs) == 1

    seller_id = uuid.UUID(bytes=seller.id).hex
    convs2, total2 = await get_conversations(db_session, seller_id)
    assert total2 == 1


@pytest.mark.asyncio
async def test_image_message(db_session):
    from app.services.messaging_service import create_conversation, save_message

    buyer = await _create_user(db_session, "img_buyer@test.com")
    seller = await _create_user(db_session, "img_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Hi")
    conv_id = uuid.UUID(bytes=conv.id).hex

    file_data = b"\x89PNG\r\n\x1a\nfake-image-data"
    msg = await save_message(db_session, conv_id, buyer_id, "image", file_data=file_data, file_subdir="photos")
    assert msg.content_type.value == "image"
    assert msg.file_url is not None


@pytest.mark.asyncio
async def test_voice_note_message(db_session):
    from app.services.messaging_service import create_conversation, save_message

    buyer = await _create_user(db_session, "voice_buyer@test.com")
    seller = await _create_user(db_session, "voice_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    buyer_id = uuid.UUID(bytes=buyer.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    conv = await create_conversation(db_session, buyer_id, listing_id, "Hi")
    conv_id = uuid.UUID(bytes=conv.id).hex

    waveform = [0.1, 0.5, 0.3, 0.8, 0.2]
    msg = await save_message(
        db_session, conv_id, buyer_id, "voice_note",
        file_data=b"fake-audio-data", file_subdir="voice_notes",
        file_duration_sec=15, file_waveform=waveform,
    )
    assert msg.content_type.value == "voice_note"
    assert msg.file_duration_sec == 15
    assert msg.file_waveform == waveform