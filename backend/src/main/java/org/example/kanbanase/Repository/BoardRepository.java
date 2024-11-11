package org.example.kanbanase.Repository;

import org.example.kanbanase.Entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, String> {
    List<Board> findByUserId(String userId);
}