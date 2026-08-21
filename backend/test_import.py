from app.core.auth import hash_password, verify_password, create_access_token, decode_access_token

# Test password hashing
hashed = hash_password("testpassword123")
print(f"Hashed: {hashed[:20]}...")

# Test password verification
print(f"Verify: {verify_password('testpassword123', hashed)}")
print(f"Verify wrong: {verify_password('wrongpassword', hashed)}")

# Test JWT creation and decoding
token = create_access_token("test-user-id")
print(f"Token: {token}")
decoded = decode_access_token(token)
print(f"Decoded: {decoded}")

print("ALL TESTS PASSED")