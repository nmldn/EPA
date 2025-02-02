from cryptography.fernet import Fernet

key = Fernet.generate_key()
with open("key.key", "wb") as key_file:
    key_file.write(key)


with open(".env", "rb") as env_file:
    env_data = env_file.read()

fernet = Fernet(key)
encrypted_data = fernet.encrypt(env_data)

with open(".env.enc", "wb") as enc_file:
    enc_file.write(encrypted_data)

print("Encryption complete! Key saved as 'key.key', and '.env.enc' created.")
