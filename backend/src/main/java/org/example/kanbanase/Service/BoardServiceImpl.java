package org.example.kanbanase.Service;

import org.example.kanbanase.Entity.Board;
import org.example.kanbanase.Repository.BoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardServiceImpl implements BoardService {
    private static final String DEFAULT_BOARD_DATA = "{\"cols\":[{\"id\":9925,\"title\":\"Today\"},{\"id\":\"done\",\"title\":\"Pending\"},{\"id\":6709,\"title\":\"Done\"}],\"tasks\":[]}";
    @Autowired
    private BoardRepository boardRepository;

    @Override
    public List<Board> getBoardsByUser(String userId) {
        return boardRepository.findByUserId(userId);
    }

    @Override
    public Board getBoardById(String id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));
    }

    @Override
    public void deleteBoard(String id) {
        boardRepository.deleteById(id);
    }

    @Override
    public Board createBoard(String name, String description, String userId) {
        Board board = new Board();
        board.setName(name);
        board.setDescription(description);
        board.setData(DEFAULT_BOARD_DATA);
        board.setUserId(userId);
        return boardRepository.save(board);
    }

    @Override
    public Board updateBoard(String id, String data) {
        Board board = getBoardById(id);
        board.setData(data);
        return boardRepository.save(board);
    }
}