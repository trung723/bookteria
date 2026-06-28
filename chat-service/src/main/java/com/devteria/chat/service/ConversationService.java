package com.devteria.chat.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.devteria.chat.dto.request.ConversationRequest;
import com.devteria.chat.dto.response.ConversationResponse;
import com.devteria.chat.entity.Conversation;
import com.devteria.chat.entity.ParticipantInfo;
import com.devteria.chat.exception.AppException;
import com.devteria.chat.exception.ErrorCode;
import com.devteria.chat.mapper.ConversationMapper;
import com.devteria.chat.repository.ChatMessageRepository;
import com.devteria.chat.repository.ConversationRepository;
import com.devteria.chat.repository.httpclient.ProfileClient;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationService {
    ConversationRepository conversationRepository;
    ChatMessageRepository chatMessageRepository;
    ProfileClient profileClient;

    ConversationMapper conversationMapper;

    public List<ConversationResponse> myConversations() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Conversation> conversations = conversationRepository.findAllByParticipantIdsContains(userId);

        return conversations.stream().map(this::toConversationResponse).toList();
    }

    public ConversationResponse create(ConversationRequest request) {
        // Fetch user infos
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = profileClient.getProfile(userId);
        var participantInfoResponse =
                profileClient.getProfile(request.getParticipantIds().get(0));

        if (Objects.isNull(userInfoResponse) || Objects.isNull(participantInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();
        var participantInfo = participantInfoResponse.getResult();

        List<String> userIds = new ArrayList<>();
        userIds.add(userId);
        userIds.add(participantInfo.getUserId());

        var sortedIds = userIds.stream().sorted().toList();
        String userIdHash = generateParticipantHash(sortedIds);

        var conversation = conversationRepository
                .findByParticipantsHash(userIdHash)
                .orElseGet(() -> {
                    List<ParticipantInfo> participantInfos = List.of(
                            ParticipantInfo.builder()
                                    .userId(userInfo.getUserId())
                                    .username(userInfo.getUsername())
                                    .firstName(userInfo.getFirstName())
                                    .lastName(userInfo.getLastName())
                                    .avatar(userInfo.getAvatar())
                                    .build(),
                            ParticipantInfo.builder()
                                    .userId(participantInfo.getUserId())
                                    .username(participantInfo.getUsername())
                                    .firstName(participantInfo.getFirstName())
                                    .lastName(participantInfo.getLastName())
                                    .avatar(participantInfo.getAvatar())
                                    .build());

                    // Build conversation info
                    Conversation newConversation = Conversation.builder()
                            .type(request.getType())
                            .participantsHash(userIdHash)
                            .createdDate(Instant.now())
                            .modifiedDate(Instant.now())
                            .participants(participantInfos)
                            .build();

                    return conversationRepository.save(newConversation);
                });

        return toConversationResponse(conversation);
    }

    private String generateParticipantHash(List<String> ids) {
        StringJoiner stringJoiner = new StringJoiner("_");
        ids.forEach(stringJoiner::add);

        // SHA 256

        return stringJoiner.toString();
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        ConversationResponse conversationResponse = conversationMapper.toConversationResponse(conversation);

        conversation.getParticipants().stream()
                .filter(participantInfo -> !participantInfo.getUserId().equals(currentUserId))
                .findFirst()
                .ifPresent(participantInfo -> {
                    conversationResponse.setConversationName(participantInfo.getUsername());
                    conversationResponse.setConversationAvatar(participantInfo.getAvatar());
                });

        return conversationResponse;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<ConversationResponse> getAllConversations() {
        List<Conversation> conversations = conversationRepository.findAll();
        return conversations.stream()
                .map(c -> {
                    ConversationResponse resp = conversationMapper.toConversationResponse(c);
                    if (c.getParticipants() != null && !c.getParticipants().isEmpty()) {
                        String names = c.getParticipants().stream()
                                .map(ParticipantInfo::getUsername)
                                .collect(Collectors.joining(", "));
                        resp.setConversationName(names);
                        resp.setConversationAvatar(c.getParticipants().get(0).getAvatar());
                    }
                    return resp;
                })
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteConversation(String conversationId) {
        conversationRepository.deleteById(conversationId);
        chatMessageRepository.deleteAllByConversationId(conversationId);
    }
}
