import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './search.module.scss';
import classNames from 'classnames';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { LoadingAnimation } from '../loading-animation/loading-animation';
import { storage } from '../../firebase'; // Import the Firebase storage object
import DOMPurify from 'dompurify';
import moment from 'moment';
import axios from 'axios';

export interface SearchProps {
  className?: string;
}

export const Search = ({ className }: SearchProps) => {
  const [posts, setPosts] = useState<
    {
      username: string;
      title: string;
      desc: string;
      img: string;
      id: string;
      cat: string;
      liked: boolean;
      likeCount: number;
      date: string;
      userImg: string;
    }[]
  >([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchPosts = async (query: string) => {
    try {
      setPosts([]);
      setIsSearching(true);
      const res = await axios.get(`https://fbapi-668309e6ed75.herokuapp.com/api/posts/search/searchmoto?sc=${query}`);
      setIsSearching(false);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = (e: any) => {
    if (e.key === 'Enter') {
      fetchPosts(e.target.value);
    }
  };

  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchBtn = () => {
    fetchPosts(searchQuery);
  };

  const getText = (html: string, maxLength: number) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const textContent = doc.body.textContent || '';
    if (textContent.length <= maxLength) {
      return textContent;
    } else {
      return textContent.substring(0, maxLength) + '...';
    }
  };

  const formatCategoryName = (category: any) => {
    if (category === 'healthyfood') {
      return 'Healthy Food';
    } else if (category === 'intfood') {
      return 'International Food';
    } else if (category.match(/[A-Z]/)) {
      const words = category.split(/(?=[A-Z])/);
      const formattedName = words.map((word: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return formattedName;
    } else {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  useEffect(() => {
    const fetchPostsData = async () => {
      try {
        setIsSearching(true);
        const res = await axios.get('https://fbapi-668309e6ed75.herokuapp.com/api/posts/allposts');
        const postsData = res.data;

        // Update the image URLs for each post
        const postsWithImages = await Promise.all(
          postsData.map(async (post: any) => {
            const imgURL = post.img ? await storage.ref(post.img).getDownloadURL() : '';
            const userImgURL = post.userImg ? await storage.ref(post.userImg).getDownloadURL() : '';
            return { ...post, img: imgURL, userImg: userImgURL };
          })
        );

        setIsSearching(false);
        setPosts(postsWithImages);
      } catch (err) {
        setIsSearching(false);
        console.log(err);
      }
    };

    fetchPostsData();
  }, []);

  return (
    <div className={classNames(styles.root, className)}>
      <Navbar />
      <div className={styles.searchContainer}>
        <div className={styles.searchbar}>
          <input className={styles.searchInput} placeholder={'Search here!'} onKeyDown={handleSearch} onChange={handleSearchChange} />
          <div className={styles.searchLogo} onClick={handleSearchBtn}>
            <SearchOutlinedIcon sx={{ fontSize: 50 }} />
          </div>
        </div>
        <div className={styles.searchCount}>
          {isSearching ? <LoadingAnimation /> : `There are ${Object.keys(posts).length} results found`}
        </div>
        <div className={styles.searchRes}>
          {Object.keys(posts).length == 0 && !isSearching ? (
            <img className={styles.searchResNotFound} src="not-found.png" />
          ) : (
            posts.map((post) => (
              <div className={classNames(styles.cardpost, className)} key={post.id}>
                <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                  <div className={styles.container}>
                    <img className={styles.imgclass} src={`../upload/${post.img}`} />
                    <div className={styles.contents}>
                      <div className={styles.catContainer}>
                        <span className={styles.cat}>{formatCategoryName(post.cat)}</span>
                      </div>
                      <span className={styles.title}>{post.title}</span>
                      <p className={styles.content11}>{getText(DOMPurify.sanitize(post.desc), 100)}</p>
                    </div>
                    <div className={styles.user}>
                      <img src={`../upload/${post.userImg}`} className={styles.profPic} />
                      <div className={styles.profInfo}>
                        <span className={styles.username}>{post.username}</span>
                        <span className={styles.time}>{moment(post.date).fromNow()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
