import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { fetchPosts } from "../store/postsSlice";
import { useAppDispatch } from "../store/store";
import { fetchUsers } from "../store/usersSlice";
import { RootStoreState } from "../interfaces/store.interfaces";
import { IPost } from "../interfaces/post.interfaces";
import NewsCard from "../components/NewsCard";
import SearchBar from "../components/SearchBar";
import PostsPagination from "../components/PostsPagination";

const POSTS_PER_PAGE = 10;

function Index() {
  const dispatch = useAppDispatch();
  const posts = useSelector((state: RootStoreState) => state.posts.posts);
  const users = useSelector((state: RootStoreState) => state.users.users);
  const [filteredPosts, setFilteredPosts] = useState<IPost[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const postsRef = useRef(posts);
  
  const currentPosts = useMemo(() => filteredPosts.slice(indexOfFirstPost, indexOfLastPost), [filteredPosts, indexOfFirstPost, indexOfLastPost]);

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchUsers());
  }, [dispatch]);
  
  useEffect(() => {
    if (posts == postsRef.current) return;
    setFilteredPosts(posts);
    postsRef.current = posts;
  }, [posts]);

  // This search will filter all the posts, returning all who includes the query as the post title or as the author name
  const handleSearch = useCallback((query: string) => {
    // This will create a Map to associate the user.id with the user.name
    const userMap = new Map<number, string>();
    users.forEach((user) => {
      userMap.set(user.id, user.name);
    });

    const filteredPosts = posts.filter((post: IPost) => {
      const title = post.title.toLowerCase();
      const author = userMap.get(post.userId)?.toLowerCase() || "";
      return title.includes(query.toLowerCase()) || author.includes(query.toLowerCase());
    });

    setFilteredPosts(filteredPosts);
    setCurrentPage(1);
  }, [setFilteredPosts, posts, users]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 flex flex-col gap-5">
        <SearchBar onSearch={handleSearch} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPosts && currentPosts.map((post: IPost) => <NewsCard key={post.id} post={post} />)}
        </div>
        <PostsPagination
          postsPerPage={POSTS_PER_PAGE}
          totalPosts={filteredPosts.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default Index;
