package org.example.kanbanase.Service;

import org.example.kanbanase.Entity.Board;

import java.util.List;

public interface BoardService {
    List<Board> getBoardsByUser(String userId);

    Board getBoardById(String id);

    void deleteBoard(String id);

    Board createBoard(String name, String description, String userId);

    Board updateBoard(String id, String data);
}