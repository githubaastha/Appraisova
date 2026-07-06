package com.project.AppraisalSystem.service.implementation;

import com.project.AppraisalSystem.dto.DepartmentRequestDTO;
import com.project.AppraisalSystem.dto.DepartmentResponseDTO;
import com.project.AppraisalSystem.entity.Department;
import com.project.AppraisalSystem.exception.BadRequestException;
import com.project.AppraisalSystem.exception.DuplicateResourceException;
import com.project.AppraisalSystem.exception.ResourceNotFoundException;
import com.project.AppraisalSystem.repository.DepartmentRepository;
import com.project.AppraisalSystem.service.DepartmentService;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> findAll() {
        return departmentRepository.findAll()
                .stream()
                .sorted((a, b) -> a.getDeptName().compareTo(b.getDeptName()))
                .map(dept -> modelMapper.map(dept, DepartmentResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponseDTO findById(Long deptId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + deptId));
        return modelMapper.map(dept, DepartmentResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponseDTO findByName(String deptName) {
        Department dept = departmentRepository.findByDeptName(deptName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with name: " + deptName));
        return modelMapper.map(dept, DepartmentResponseDTO.class);
    }

    @Override
    public DepartmentResponseDTO addDepartment(DepartmentRequestDTO dto) {
        if (dto.getDeptName() == null || dto.getDeptName().isBlank()) {
            throw new BadRequestException("Department name cannot be empty");
        }
        departmentRepository.findByDeptName(dto.getDeptName().trim())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException(
                            "Department already exists: " + dto.getDeptName());
                });
        Department department = modelMapper.map(dto, Department.class);
        department.setDeptName(department.getDeptName().trim());
        return modelMapper.map(departmentRepository.save(department),
                DepartmentResponseDTO.class);
    }

    @Override
    public DepartmentResponseDTO updateDepartment(Long deptId, DepartmentRequestDTO dto) {
        Department existing = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + deptId));

        departmentRepository.findByDeptName(dto.getDeptName().trim())
                .filter(found -> !found.getDeptId().equals(deptId))
                .ifPresent(found -> {
                    throw new DuplicateResourceException(
                            "Department name already taken: " + dto.getDeptName());
                });

        existing.setDeptName(dto.getDeptName().trim());
        existing.setDeptDescription(dto.getDeptDescription());
        return modelMapper.map(departmentRepository.save(existing),
                DepartmentResponseDTO.class);
    }

    @Override
    public boolean deleteDepartment(Long deptId) {

        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + deptId));

        if (dept.getUsers() != null && !dept.getUsers().isEmpty()) {
            throw new BadRequestException(
                    "Cannot delete department. It has assigned users.");
        }

        departmentRepository.delete(dept);
        return true;
    }

    @Override
    public DepartmentResponseDTO patchDepartment(Long deptId, DepartmentRequestDTO dto) {
        Department existing = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + deptId));

        if (dto.getDeptName() != null) {
            String newName = dto.getDeptName().trim();
            if (newName.isBlank()) {
                throw new BadRequestException("Department name cannot be blank");
            }
            departmentRepository.findByDeptName(newName)
                    .filter(found -> !found.getDeptId().equals(deptId))
                    .ifPresent(found -> {
                        throw new DuplicateResourceException(
                                "Department name already taken: " + newName);
                    });
            existing.setDeptName(newName);
        }

        if (dto.getDeptDescription() != null) {
            existing.setDeptDescription(dto.getDeptDescription());
        }

        return modelMapper.map(departmentRepository.save(existing),
                DepartmentResponseDTO.class);
    }
}