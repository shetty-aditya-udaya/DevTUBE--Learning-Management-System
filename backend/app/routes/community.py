from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.community import Post, Comment, Like
from app.models.user import User
from app.models.course import Course
from datetime import datetime


community_bp = Blueprint("community", __name__)


@community_bp.route("/posts", methods=["GET"])
@jwt_required(optional=True)
def get_posts():
    current_user_id = get_jwt_identity()

    # Filter params
    filter_type = request.args.get("filter", "all") # all, students, instructors, courses, ideas
    
    query = Post.query.order_by(Post.created_at.desc())

    if filter_type == "students":
        query = query.join(User).filter(User.role == "student")
    elif filter_type == "instructors":
        query = query.join(User).filter(User.role == "instructor")
    elif filter_type == "courses":
        query = query.filter(Post.course_id.isnot(None))
    elif filter_type == "ideas":
        # Specific hashtag or similar logic could go here
        pass

    posts = query.limit(20).all()
    return jsonify({
        "status": "success",
        "data": [post.to_dict(current_user_id) for post in posts]
    }), 200


@community_bp.route("/posts", methods=["POST"])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    data = request.get_json()

    content = data.get("content")
    image_url = data.get("image_url")
    course_id = data.get("course_id")

    if not content:
        return jsonify({"status": "error", "message": "Content is required"}), 400

    post = Post(
        user_id=user_id,
        content=content,
        image_url=image_url,
        course_id=course_id
    )

    db.session.add(post)
    db.session.commit()

    return jsonify({
        "status": "success",
        "data": post.to_dict(user_id),
        "message": "Post created successfully"
    }), 201


@community_bp.route("/posts/<int:post_id>/like", methods=["POST"])
@jwt_required()
def toggle_like(post_id):
    user_id = get_jwt_identity()
    
    like = Like.query.filter_by(post_id=post_id, user_id=user_id).first()

    if like:
        db.session.delete(like)
        db.session.commit()
        return jsonify({"status": "success", "message": "Post unliked", "has_liked": False}), 200
    else:
        new_like = Like(post_id=post_id, user_id=user_id)
        db.session.add(new_like)
        db.session.commit()
        return jsonify({"status": "success", "message": "Post liked", "has_liked": True}), 201


@community_bp.route("/posts/<int:post_id>/comments", methods=["GET"])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    return jsonify({
        "status": "success",
        "data": [comment.to_dict() for comment in comments]
    }), 200


@community_bp.route("/posts/<int:post_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(post_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get("content")

    if not content:
        return jsonify({"status": "error", "message": "Comment content is required"}), 400

    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=content
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify({
        "status": "success",
        "data": comment.to_dict(),
        "message": "Comment added successfully"
    }), 201
