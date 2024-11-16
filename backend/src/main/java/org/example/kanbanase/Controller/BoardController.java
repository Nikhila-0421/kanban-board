package org.example.kanbanase.Controller;

import org.example.kanbanase.Entity.Board;
import org.example.kanbanase.Service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {
    @Autowired
    private BoardService boardService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Board>> getBoardsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(boardService.getBoardsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoardById(@PathVariable String id) {
        return ResponseEntity.ok(boardService.getBoardById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Board> createBoard(@RequestBody Board board) {
        Board created = boardService.createBoard(board.getName(), board.getDescription(), board.getUserId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(@PathVariable String id, @RequestBody String data) {
        return ResponseEntity.ok(boardService.updateBoard(id, data));
    }
}