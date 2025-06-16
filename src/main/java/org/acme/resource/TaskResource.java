package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.acme.model.Task;
import org.jboss.resteasy.reactive.RestQuery;
import jakarta.persistence.EntityManager;
import java.util.List;

@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TaskResource {
    @Inject
    EntityManager em;

    @GET
    public List<Task> getAll(@RestQuery("completed") Boolean completed) {
        if (completed == null) {
            return em.createQuery("from Task", Task.class).getResultList();
        }
        return em.createQuery("from Task where completed = :completed", Task.class)
                .setParameter("completed", completed)
                .getResultList();
    }

    @POST
    @Transactional
    public Task add(Task task) {
        System.out.println("Adding task: " + task.toString());
        em.persist(task);
        return task;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        Task t = em.find(Task.class, id);
        if (t != null) em.remove(t);
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    public Task update(@PathParam("id") Long id, Task task) {
        Task t = em.find(Task.class, id);
        if (t == null) throw new NotFoundException();
        t.title = task.title;
        t.completed = task.completed;
        return t;
    }

    @POST
    @Path("/test")
    public String testPost() {
        System.out.println("=== /tasks/test POST reached ===");
        return "Hello POST";
    }
}
