import styles from './blog-single.module.scss';
import classNames from 'classnames';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { Location } from 'react-router';
import DOMPurify from 'dompurify';
import { Footer } from '../footer/footer';
import { Navbar } from '../navbar/navbar';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthContext } from '../../context/authContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import { storage } from '../../firebase'; // Import the 'storage' object from 'firebase.tsx' with correct path


export interface BlogSingleProps {
	className?: string;
}


export const BlogSingle = ({ className }: BlogSingleProps) => {
	const { currentUser } = useContext(AuthContext);
	const location = useLocation();
	const navigate = useNavigate();


	const currentUserID = currentUser.id;
	const [comment, setComment] = useState('');

	const postId = location.pathname.split('/')[2];

	const handleClick = async (e: any) => {
		e.preventDefault();

		try {
			await axios.post(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}/comment`, {
				comment,
				date: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
			});
			// Clear the comment input field or update the comments list
			setComment('');

			const response = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/comments/latest`);
			const latestcomment = response.data;
			await axios.post(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}/notifAddComment`, {
				currentUserID,
				postId,
				date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
				latestcomment: latestcomment.id,
				passage: "commented on your post"
			});
			
      window.location.reload();
		} catch (err) {
			console.log(err);
		}

		// Wait for 2 seconds before refreshing the page
		window.location.reload();
	};

	const commentDelete = async (commentId: any) => {
		try {
			await axios.delete(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}/deleteComment/${commentId}`);
		} catch (err) {
			console.log(err);
		}

		window.location.reload();
	};

	const cat = useLocation().search;

	const isAdmin = currentUser?.isAdmin;

	const getText = (html: any) => {
		const doc = new DOMParser().parseFromString(html, 'text/html');
		return doc.body.textContent;
	};

	const [post, setPost] = useState<{
		img: string;
		username: string;
		title: string;
		desc: string;
		likes: string;
		userImg: string;
		uid: string;
	}>({
		img: '',
		username: '',
		title: '',
		desc: '',
		likes: '',
		userImg: '',
		uid: '',
	});
	useEffect(() => {
		const fetchData = async () => {
		  try {
			const res = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}`);
			const postData = res.data;
			setPost({
			  ...postData,
			  img: postData.img ? await storage.ref(postData.img).getDownloadURL() : '',
			  userImg: postData.userImg ? await storage.ref(postData.userImg).getDownloadURL() : '',
			});
		  } catch (err) {
			console.log(err);
		  }
		};
		fetchData();
	  }, [postId]);

	const currentUserOwnsPost = currentUser?.id === post?.uid;
	const userID = currentUser.id;
	console.log(currentUserOwnsPost)

	const handleDelete = async () => {
		try {
			await axios.delete(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}`);
			navigate('/');
		} catch (err) {
			console.log(err);
		}
	};

	const [liked, setLiked] = useState(false);


	const handleLike = async () => {
		try {
			if (liked) {
				// Unlike the post
				await axios.post(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}/unlike`);
				setLiked(false);
				setPost((prevPost) => ({
					...prevPost,
					likes: (parseInt(prevPost.likes) - 1).toString(),
				}));
			} else {
				// Like the post
				await axios.post(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}/like`);
				setLiked(true);
				setPost((prevPost) => ({
					...prevPost,
					likes: (parseInt(prevPost.likes) + 1).toString(),
					date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
				}));
				const response = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/likes/latest`);
				const latestLike = response.data;

				// add info to notif db
				await axios.post(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}/notifAdd`, {
				  currentUserID,
				  postId,
				  date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
				  latestLike: latestLike.idlike,
				  passage: "likes your post"
				});
			}
		} catch (error) {
			console.error(error);
		}
	};

	const [likeCount, setLikeCount] = useState(0);

	const handleCopy = async () => {
		try {
			const url = window.location.href;
			await navigator.clipboard.writeText(url);
			console.log('URL copied to clipboard:', url);
		} catch (error) {
			console.error('Failed to copy URL to clipboard:', error);
		}
	};

	useEffect(() => {
		if (!currentUser) {
			navigate('/login');
		}
	}, [currentUser, navigate]);


	const [comments, setComments] = useState<{
		commentData: string;
		date: string;
		username: string;
		uid: string;
		id: string;
		userImage: string;
	}[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}/getComments`);
				setComments(res.data);
			} catch (err) {
				console.log(err);
			}
		};
		fetchData();
	}, [postId]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}`);
				setPost(res.data);
			} catch (err) {
				console.log(err);
			}
		};
		fetchData();
	}, [postId]);


	useEffect(() => {
		const fetchPostLikedStatus = async () => {
			try {
				const response = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/${postId}/likedStatus`);
				const { liked, likeCount } = response.data;

				setLiked(liked);
				setLikeCount(likeCount);
			} catch (error) {
				console.error(error);
			}
		};

		fetchPostLikedStatus();
	}, [postId]);

	return (
		<div className={classNames(styles.root, className)}>
			<Navbar />
			<div className={styles.container}>
				<div className={styles.arrow}>
					<ArrowBackIcon sx={{ cursor: "pointer" }} />
				</div>
				<img
					className={styles.blogPic}
					src={post?.img}
				/>
				<div className={styles.blogContent}>
					<div className={styles.profile}>
						<img className={styles.pic} src={post?.userImg} />
						<Link style={{ textDecoration: 'none', color: "black" }} to={`/adminprofile/${post.uid}`} className={styles.name}>
							<span className={styles.name}>{post.username}</span>
						</Link>
					</div>

					<div className={styles.content}>
						<h1 className={styles.title}>{post.title}</h1>

						<p className={styles.contentText}
							dangerouslySetInnerHTML={{
								__html: DOMPurify.sanitize(post.desc),
							}}
						>

						</p>

					</div>
					<div className={styles.postFoot}>
						<hr className={styles.divier} />
						<div className={classNames(styles.icons, styles.icons)}>
							<div className={styles.left}>
								<ModeCommentOutlinedIcon sx={{ cursor: 'pointer' } } />
								<p className={styles.commentNum}>{Object.keys(comments).length}</p>
								<InsertLinkIcon sx={{ cursor: 'pointer' }} onClick={handleCopy} />
								   {currentUserOwnsPost ? (
                            <>
                              <DeleteOutlineOutlinedIcon onClick={handleDelete} sx={{ cursor: 'pointer' }} />
                              {isAdmin || currentUserOwnsPost ? (
                                <Link style={{ textDecoration: 'none', color: "black" }} to={`/edit/${postId}`} state={post}>
                                  <EditOutlinedIcon sx={{ cursor: 'pointer' }}  />
                                </Link>
                              ) : null}
                            </>
                          ) : null}
							</div>
							<div className={styles.right}>
								{liked ? (
									<FavoriteIcon
										sx={{ cursor: 'pointer', color: 'red' }}
										onClick={handleLike}
									/>
								) : (
									<FavoriteBorderOutlinedIcon
										sx={{ cursor: 'pointer' }}
										onClick={handleLike}
									/>
								)}
								<span className={styles.likeNum}>{post.likes}</span>
							</div>
						</div>
					</div>
				</div>


			</div>

			<div className={classNames(styles.comentsss, className)}>
				<div className={styles.commentcontainer}>
					<h1 className={styles.header}>Comments</h1>
					<hr className={styles.divider} />
					<div className={styles.commentHouse}>
						{comments.map((comment) => (
							<div className={styles.commentBox}>
								<div>
									<img
										src={comment?.userImage}
										className={styles.user}
									/>
								</div>
								<div className={styles.commentText}>

									<span className={styles.username}>{comment.username}</span>

									<span className={styles.commentcontent}>{comment.commentData}</span>
									<span className={styles.date}>{moment(comment.date).fromNow()}</span>
								</div>
								{comment.uid === currentUser?.id && (
									<DeleteOutlineOutlinedIcon
										onClick={() => commentDelete(comment.id)}
										sx={{ cursor: 'pointer' }}
									/>
								)}
							</div>
						))}
					</div>
					<div className={styles.yourCommentContainer}>
						<div className={styles.upper}>
							<textarea className={styles.textArea} placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
							<SendIcon sx={{ fontSize: 30, cursor: 'pointer' }} onClick={handleClick} />
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};