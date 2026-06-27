package com.devteria.profile.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.profile.entity.UserProfile;

@Repository
public interface UserProfileRepository extends Neo4jRepository<UserProfile, String> {
    Optional<UserProfile> findByUserId(String userId);

    List<UserProfile> findAllByUsernameLike(String username);

    @Query(
            "MATCH (a:user_profile {userId: $followerId})-[:FOLLOWS]->(b:user_profile {userId: $followingId}) RETURN count(a) > 0")
    boolean isFollowing(@Param("followerId") String followerId, @Param("followingId") String followingId);

    @Query("MATCH (a:user_profile {userId: $userId})-[:FOLLOWS]->(b:user_profile) RETURN b")
    List<UserProfile> findFollowing(@Param("userId") String userId);

    @Query("MATCH (b:user_profile)-[:FOLLOWS]->(a:user_profile {userId: $userId}) RETURN b")
    List<UserProfile> findFollowers(@Param("userId") String userId);

    @Query("MATCH (a:user_profile {userId: $userId})-[:FOLLOWS]->(b:user_profile) RETURN b.userId")
    List<String> findFollowingUserIds(@Param("userId") String userId);

    @Query("MATCH (a:user_profile {userId: $followerId}), (b:user_profile {userId: $followingId}) "
            + "MERGE (a)-[:FOLLOWS]->(b)")
    void follow(@Param("followerId") String followerId, @Param("followingId") String followingId);

    @Query("MATCH (a:user_profile {userId: $followerId})-[r:FOLLOWS]->(b:user_profile {userId: $followingId}) DELETE r")
    void unfollow(@Param("followerId") String followerId, @Param("followingId") String followingId);
}
