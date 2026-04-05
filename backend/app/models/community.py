from app.extensions import db
from datetime import datetime


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", backref=db.backref("posts", lazy="dynamic"))
    course = db.relationship("Course", backref=db.backref("linked_posts", lazy="dynamic"))
    comments = db.relationship("Comment", backref="post", lazy="dynamic", cascade="all, delete-orphan")
    likes = db.relationship("Like", backref="post", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, current_user_id=None):
        return {
            "id": self.id,
            "content": self.content,
            "image_url": self.image_url,
            "course_id": self.course_id,
            "created_at": self.created_at.isoformat(),
            "user": {
                "id": self.user.id,
                "name": self.user.name,
                "role": self.user.role
            },
            "likes_count": self.likes.count(),
            "comments_count": self.comments.count(),
            "has_liked": self.likes.filter_by(user_id=current_user_id).first() is not None if current_user_id else False
        }


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "user": {
                "id": self.user.id,
                "name": self.user.name,
                "role": self.user.role
            },
        }


class Like(db.Model):
    __tablename__ = "likes"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint("post_id", "user_id", name="unique_user_post_like"),)
