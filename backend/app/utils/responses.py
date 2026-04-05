from flask import jsonify


def success_response(data=None, message="Success", status_code=200):
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response), status_code


def error_response(message="An error occurred", status_code=400, errors=None, traceback=None):
    response = {"success": False, "message": message}
    if errors:
        response["errors"] = errors
    if traceback:
        response["traceback"] = traceback
    return jsonify(response), status_code
