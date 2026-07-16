package com.project.AppraisalSystem.repository;

import com.project.AppraisalSystem.entity.Appraisals;
import com.project.AppraisalSystem.entity.enums.AppraisalStatus;
import com.project.AppraisalSystem.entity.enums.CycleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppraisalsRepository extends JpaRepository<Appraisals, Long> {

    @Query(value = "SELECT a FROM Appraisals a " +
            "JOIN FETCH a.employee e " +
            "JOIN FETCH a.manager m " +
            "LEFT JOIN FETCH e.department",
            countQuery = "SELECT COUNT(a) FROM Appraisals a")
    Page<Appraisals> findAllPaged(Pageable pageable);

    @Query("SELECT a FROM Appraisals a " +
            "JOIN FETCH a.employee e " +
            "JOIN FETCH a.manager m " +
            "LEFT JOIN FETCH e.department " +
            "WHERE e.userId = :employeeId")
    List<Appraisals> findAllByEmployee_UserId(@Param("employeeId") Long employeeId);

    @Query("SELECT a FROM Appraisals a " +
            "JOIN FETCH a.employee e " +
            "JOIN FETCH a.manager m " +
            "LEFT JOIN FETCH e.department " +
            "WHERE e.email = :email")
    List<Appraisals> findAllByEmployee_Email(@Param("email") String email);

    @Query(value = "SELECT a FROM Appraisals a " +
            "JOIN FETCH a.employee e " +
            "JOIN FETCH a.manager m " +
            "LEFT JOIN FETCH e.department " +
            "WHERE m.userId = :managerId",
            countQuery = "SELECT COUNT(a) FROM Appraisals a WHERE a.manager.userId = :managerId")
    Page<Appraisals> findAllByManager_UserId(@Param("managerId") Long managerId, Pageable pageable);

    List<Appraisals> findAllByManager_Email(String email);

    @Query(value = "SELECT a FROM Appraisals a " +
            "JOIN FETCH a.employee e " +
            "JOIN FETCH a.manager m " +
            "LEFT JOIN FETCH e.department " +
            "WHERE a.cycleName = :cycleName",
            countQuery = "SELECT COUNT(a) FROM Appraisals a WHERE a.cycleName = :cycleName")
    Page<Appraisals> findAllByCycleName(@Param("cycleName") String cycleName, Pageable pageable);

    @Query(value = "SELECT a FROM Appraisals a " +
            "JOIN FETCH a.employee e " +
            "JOIN FETCH a.manager m " +
            "LEFT JOIN FETCH e.department " +
            "WHERE a.appraisalStatus = :appraisalStatus",
            countQuery = "SELECT COUNT(a) FROM Appraisals a WHERE a.appraisalStatus = :appraisalStatus")
    Page<Appraisals> findAllByAppraisalStatus(@Param("appraisalStatus") AppraisalStatus appraisalStatus, Pageable pageable);

    @Query(value = "SELECT a FROM Appraisals a " +
            "JOIN FETCH a.employee e " +
            "JOIN FETCH a.manager m " +
            "LEFT JOIN FETCH e.department " +
            "WHERE a.cycleStatus = :cycleStatus",
            countQuery = "SELECT COUNT(a) FROM Appraisals a WHERE a.cycleStatus = :cycleStatus")
    Page<Appraisals> findAllByCycleStatus(@Param("cycleStatus") CycleStatus cycleStatus, Pageable pageable);

    boolean existsByCycleNameAndEmployee_UserId(String cycleName, Long employeeId);

    Optional<Appraisals> findByCycleNameAndEmployee_Email(String cycleName, String email);
}