import styles from './user-profile.module.scss';
import classNames from 'classnames';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { MiniPost } from '../mini-post/mini-post';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/authContext';
import axios from 'axios';
import { storage } from '../../firebase'; // Import the Firebase storage object
import { Link, useLocation, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

export interface UserProfileProps {
  className?: string;
}

export const UserProfile = ({ className }: UserProfileProps) => {
  const [likes, setLikes] = useState<{ img: string, id: string }[]>([]);
  const { currentUser, logout } = useContext(AuthContext)
  const [file, setFile] = useState<File | null>(null);
  const location = useLocation();
  const postId = location.pathname.split("/")[2];
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [userr, setUser] = useState<{ img: string, name: string, bio: string, username: string }>({
    img: '',
    name: '',
    bio: '',
    username: ''
  });
  const [userEdit, setUserEdit] = useState<{ img: string, name: string, bio: string, username: string }>({
    img: '',
    name: '',
    bio: '',
    username: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/user/${postId}`);
        setLikes(res.data);

        // Fetch user data including the profile image from Firebase Storage
        const userRes = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/users/getuser/${userId}`);
        const userData = userRes.data;
        if (userData.img) {
          // Get the image URL from Firebase Storage
          const imgUrl = await storage.ref(userData.img).getDownloadURL();
          // Update the userEdit state with the image URL
          setUserEdit({ ...userData, img: imgUrl });
        } else {
          setUserEdit(userData);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [postId]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const userId = location.pathname.split("/")[2];
  const isCurrentUser = currentUser?.id == userId;
  const upload = async () => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      const res = await axios.post("https://fbapi-668309e6ed75.herokuapp.com/api/upload", formData);
      return res.data
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const imgUrl = await upload();

    setUserEdit(userr);
    setEditMode(false);

    try {
      await axios.put(`https://fbapi-668309e6ed75.herokuapp.com/api/users/${userId}`, {
        name: userr.name,
        uname: userr.username,
        bbio: userr.bio,
        img: file ? imgUrl : "",
      });
    } catch (err) {
      console.log(err);
    }

    // Wait for 2 seconds before refreshing the page
    window.location.reload();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <div className={classNames(styles.root, className)}>

        <Navbar />
        <div className={styles.content}>
          <div className={styles.left1}>
            <img
              className={styles.profPic}
              src={userEdit.img} // Use the Firebase Storage image URL here
            />
            <h1 className={styles.name}>{userEdit.name}</h1>
            <span className={styles.userName}>@{userEdit.username}</span>
            <span className={styles.info}>{userEdit.bio}</span>
            {isCurrentUser && (
              <div className={styles.editButtonShadow}>
                <div className={styles.editButton} onClick={() => setEditMode(true)}>
                  <p className={styles.editButtonText}>Edit Profile</p>
                  <div className={styles.editButtonIcon}>
                    <EditIcon sx={{ fontSize: "15px" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.right1}>
            <div className={styles.head}>
              <hr className={styles.divider} />
            </div>
            <div className={styles.bod}>
              {likes.map((like) => (
                <div className={classNames(styles.root, className)} key={like.id}>
                  <Link className="link" to={`/post/${like.id}`}>
                    <img
                      className={styles.image}
                      src={`../upload/${like.img}`}
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {editMode ? (
        // Edit mode UI
        <>
          <div className={styles.editProfileOverlay}></div>
          <div className={styles.editProfile}>
            <div className={styles.editProfileHeader}>
              <p className={styles.editProfileHeaderText}>Edit Profile</p>
              <div className={styles.editProfileHeaderCloseBtn} onClick={() => { setEditMode(false) }}>
                <CloseIcon sx={{ fontSize: "30px" }} />
              </div>
            </div>
            <div className={styles.editProfileDividerThick}></div>
            <div className={styles.editProfileForm}>
              <div className={styles.editProfileFormPhotoContainer}>
                <p className={styles.editProfileFormPhotoLabel}>Profile Photo</p>
                <input type='file' id='file' onChange={e => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                  }
                }} />
              </div>
              <div className={styles.editProfileDividerThin}></div>
              <div className={styles.editProfileFormUserName}>
                <p className={styles.editProfileFormUserNameLabel}>User Name</p>
                <div className={styles.editProfileFormUserNameRight}>
                  <input className={styles.editProfileFormUserNameInput} type="text" name="name" value={userr.name} onChange={handleChange} />
                  <p className={styles.editProfileFormUserNameText}>Usernames can only contain letters, numbers, underscores, and periods</p>
                </div>
              </div>
              <div className={styles.editProfileDividerThin}></div>
              <div className={styles.editProfileFormName}>
                <p className={styles.editProfileFormNameLabel}>Name</p>
                <input className={styles.editProfileFormNameInput} type="text" name="username" value={userr.username} onChange={handleChange} />
              </div>
              <div className={styles.editProfileDividerThin}></div>
              <div className={styles.editProfileFormBio}>
                <p className={styles.editProfileFormBioLabel}>User Name</p>
                <div className={styles.editProfileFormBioRight}>
                  <textarea className={styles.editProfileBioTextArea} name="bio" value={userr.bio} onChange={handleChange} />
                  <p className={styles.editProfileFormBioText}>{userr.bio.length}/60</p>
                </div>
              </div>
            </div>
            <div className={styles.editProfileDividerThick}></div>
            <button className={styles.editProfileSaveBtn} onClick={handleClick}>Save</button>
          </div>
        </>
      ) : <></>}
    </>
  );
};
