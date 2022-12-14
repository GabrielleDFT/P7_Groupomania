/*Redux & React modules*/
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

/*Actions*/
import { followUser, unfollowUser } from "../../actions/user.actions";//ok

import { isEmpty } from "../Utils";

const FollowHandler = ({ idToFollow, type }) => {//Exports to the UpdateProfile and the Thread a FollowHandler component
            //Data
  const userData = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  const [isFollowed, setIsFollowed] = useState(false);

  const handleFollow = () => {
    dispatch(followUser(userData._id, idToFollow));
    setIsFollowed(true);
  };

  const handleUnfollow = () => {
    dispatch(unfollowUser(userData._id, idToFollow));
    setIsFollowed(false);
  };

  useEffect(() => {
    if (!isEmpty(userData.following)) {
      if (userData.following.includes(idToFollow)) {
        setIsFollowed(true);
      } else setIsFollowed(false);
    }
  }, [userData, idToFollow]);

  return (
    <>
      {isFollowed && !isEmpty(userData) && (
        <span onClick={handleUnfollow}>
          {type === "suggestion" && <button className="unfollow-btn">Abonné</button>}
          {type === "card" && <img src="./img/icons/checked.svg" alt="checked"/>}
        </span>
      )}
      {isFollowed === false && !isEmpty(userData) && (
        <span onClick={handleFollow}>
          {type === "suggestion" && <button className="follow-btn">Suivre</button>}
          {type === "card" && <img src="./img/icons/check.svg" alt="check"/>}
        </span>
      )}
    </>
  );
};

export default FollowHandler;

