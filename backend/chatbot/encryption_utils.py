from cryptography.fernet import Fernet, MultiFernet
from django.conf import settings

# support future key rotation
_fernets = [Fernet(settings.ENCRYPTION_KEY.encode())]
fernet = MultiFernet(_fernets)

def encrypt_message(plaintext: str) -> str:
    """Encrypt a plaintext message"""
    return fernet.encrypt(plaintext.encode()).decode()

def decrypt_message(ciphertext: str) -> str:
    """Decrypt an encrypted message"""
    return fernet.decrypt(ciphertext.encode()).decode()