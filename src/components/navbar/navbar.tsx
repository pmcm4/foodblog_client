import { Link } from 'react-router-dom';
import styles from './navbar.module.scss';
import classNames from 'classnames';
import { useState, useContext, useEffect } from 'react';
import { ProfileLogout } from '../profile-logout/profile-logout';
import { AuthContext } from '../../context/authContext';
import axios from 'axios';
import moment from 'moment';
import { storage } from '../../firebase'; 

export interface NavbarProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-navbars-and-templates
 */
export const Navbar = ({ className }: NavbarProps) => {

    const [notifications, setNotifications] = useState<
    {
      username: string;
      passage: string;
      date: string;
      post_image: string;
      user_image: string;
      postID: string;
    }[]
  >([]);

    const [modal, setModal] = useState(false);
    const toggleModal = () => {
        setModal(!modal);
    };
    const [notifModal, toggleNotifModal] = useState(false);
    const toggleLikeModal = () => {
        toggleNotifModal(!notifModal);
    };

    const { currentUser, logout } = useContext(AuthContext);
    const userId = currentUser?.id;

    useEffect(() => {
        const fetchNotifications = async () => {
          try {
            const res = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/allnotif/${userId}`);
            const notificationsData = res.data;
    
            // Update the image URLs for each notification
            const notificationsWithImages = await Promise.all(
              notificationsData.map(async (notif: any) => {
                const userImgURL = notif.user_image ? await storage.ref(notif.user_image).getDownloadURL() : '';
                const postImgURL = notif.post_image ? await storage.ref(notif.post_image).getDownloadURL() : '';
                return { ...notif, user_image: userImgURL, post_image: postImgURL };
              })
            );
    
            setNotifications(notificationsWithImages);
          } catch (err) {
            console.log(err);
          }
        };
        fetchNotifications();
      }, [userId]);

    var Scroll = require('react-scroll');
    var scroll = Scroll.animateScroll;

    const openSlideMenu = () => {
        const element = document.getElementById('sidemenu') as HTMLInputElement
        element.style.width
            = '400px';
    }

    const closeSlideMenu = () => {
        const element = document.getElementById('sidemenu') as HTMLInputElement
        element.style.width
            = '0';
    }
    
    return (
        <div className={classNames(styles.root, className)}>
            <span className={styles.openslide}>
                <a href="#" onClick={openSlideMenu}>
                    <svg width="30" height="30">
                        <path d="M0,5 30,5" stroke="#1b1b1b"
                            stroke-width="5" />
                        <path d="M0,14 30,14" stroke="#1b1b1b"
                            stroke-width="5" />
                        <path d="M0,23 30,23" stroke="#1b1b1b"
                            stroke-width="5" />
                    </svg>
                </a>
            </span>
            <div id="sidemenu" className={styles.sidenav}>
                <ul className={styles.sidenavul}>
                    <li><a className={styles.btnclose} onClick={closeSlideMenu}>&times;</a></li>
                    <li><a href="/" className={styles.underline}>Home </a></li>
                    <li><a href="/About" className={styles.underline}>About</a></li>
                    <li><a onClick={() => { scroll.scrollToBottom(); }} className={styles.underline}>Contact </a></li>
                </ul>
            </div>
            <div className={styles.navContainer}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <img
                        alt=""
                        className={styles.num11}
                        src="https://static.overlay-tech.com/assets/a800f9aa-48a8-4e07-8ea0-524263edbc47.png"
                    />
                </Link>
                <div className={styles.btns} >
                    <div className={styles.navRight}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <p className={styles.home}>Home</p>
                        </Link>
                        <Link to="/about" style={{ textDecoration: 'none' }}>
                            <p className={styles.about}>About</p>
                        </Link>
                        <p className={styles.home} onClick={() => { scroll.scrollToBottom(); }} >Contact</p>
                    </div>
                    <div className={styles.icons}>
                        <Link to="/search" style={{ textDecoration: 'none' }}>
                            <img
                                alt=""
                                className={styles.iconSearch}
                                src="https://static.overlay-tech.com/assets/b38ca8e3-4ac4-4f32-b6a2-949dc160f48e.svg"
                            />
                        </Link>

                        <img
                            alt=""
                            className={styles.vector}
                            src="https://static.overlay-tech.com/assets/44a6f2bd-fa39-45c1-b60b-7c3c8bb06eb6.svg"
                            onClick={toggleLikeModal}
                        />
                        <img
                            onClick={toggleModal}
                            alt=""
                            className={styles.iconUserCircleAlt}
                            src="https://static.overlay-tech.com/assets/3a13b6c1-c4c7-4d1e-95fc-603b879dbd26.svg"
                        />

                        {modal && (
                            <div className='modal'>
                                <div className={styles.overlay} onClick={toggleModal}></div>
                                <div className={classNames(styles.modal, className)}>
                                    <div className={styles.toProfileBtn}>
                                        {currentUser ? (
                                            currentUser.isAdmin ? (
                                                <Link to={`/adminprofile/${userId}`} style={{ textDecoration: 'none' }}>
                                                    <p className={styles.userProfileName}>Hello, {currentUser.username}</p>
                                                </Link>
                                            ) : (
                                                <Link to={`/profile/${userId}`} style={{ textDecoration: 'none' }}>
                                                    <p className={styles.userProfileName}>Hello, {currentUser.username}</p>
                                                </Link>
                                            )
                                        ) : (
                                            <p className={styles.userProfileName}>Hello, Guest!</p>
                                        )}
                                    </div>
                                    <div className={styles.toLogoutBtn}>
                                        {currentUser ? (
                                            <p onClick={logout} className={styles.logOut}>
                                                Log out
                                            </p>
                                        ) : (
                                            <Link style={{ textDecoration: 'none' }} className={styles.logOut} to="/login">
                                                Log in
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                    {notifModal && (
                    <div className='modal'>
                        <div className={styles.overlay} onClick={toggleLikeModal}></div>
                        <div className={classNames(styles.root1)}>
                        <div className={styles.notifBadoy}>
                            <h1 className={styles.NOTIFHEADER}>Notifications</h1>
                            {notifications.map((notif) => (
                            <Link key={notif.postID} className={styles.notifBody} to={`/post/${notif.postID}`}>
                                <div className={styles.notifBody}>
                                <div className={styles.notif}>
                                    <img className={styles.userPic} src={notif.user_image} />
                                    <div className={styles.notifText}>
                                    <span className={styles.userName}>{notif.username} <span className={styles.passage}> {notif.passage}</span></span>
                                    <span className={styles.time}>{moment(notif.date).fromNow()}</span>
                                    </div>
                                    <img className={styles.postPic} src={notif.post_image} />
                                </div>
                                </div>
                            </Link>
                            ))}
                        </div>
                        </div>
                        </div>
                          )}
                </div>
            </div>

        </div>
    );
};
