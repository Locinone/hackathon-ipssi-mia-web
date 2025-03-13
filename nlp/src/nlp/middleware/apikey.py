from flask import Flask, request, jsonify
from functools import wraps

def require_api_key(api_key):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.headers.get('x-api-key') == api_key:
                return f(*args, **kwargs)
            else:
                return jsonify({'error': 'Unauthorized'}), 401
        return decorated_function
    return decorator