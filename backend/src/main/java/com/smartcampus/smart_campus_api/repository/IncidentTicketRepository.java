package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.IncidentTicket;
import com.smartcampus.smart_campus_api.model.TicketCategory;
import com.smartcampus.smart_campus_api.model.TicketPriority;
import com.smartcampus.smart_campus_api.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    List<IncidentTicket> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    List<IncidentTicket> findByAssigneeIdOrderByCreatedAtDesc(Long assigneeId);

    List<IncidentTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<IncidentTicket> findByCategoryOrderByCreatedAtDesc(TicketCategory category);

    List<IncidentTicket> findByPriorityOrderByCreatedAtDesc(TicketPriority priority);

    List<IncidentTicket> findAllByOrderByCreatedAtDesc();
}