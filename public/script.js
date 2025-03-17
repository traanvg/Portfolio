document.addEventListener("DOMContentLoaded", () => {
  // Load the projects from the server
  fetch("/projects.json")
      .then(response => response.json())
      .then(data => {
          const projectContainer = document.getElementById("projects-container");
          projectContainer.innerHTML = data.map(project => `
              <div class="project-card">
                  <img src="${project.image}" alt="${project.title}">
                  <h3>${project.title}</h3>
                  <p>${project.description}</p>
                  <a href="${project.link}" class="btn" target="_blank">Review Project</a>
              </div>
          `).join("");
      })
      .catch(error => {
          console.error("Error loading projects:", error);
          // You can add some fallback UI in case of error, e.g., a message in the project container
      });
});

document.getElementById("contact-form").addEventListener("submit", async function(event) {
  event.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
      const response = await fetch("/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
      });

      if (response.ok) {
          alert("Message sent successfully!");
          this.reset(); // Reset form after success
      } else {
          alert("Failed to send message. Please try again later.");
      }
  } catch (error) {
      console.error("Error:", error);
      alert("Error sending message. Please try again later.");
  }
});

fetch("/messages")
      .then((response) => response.json())
      .then((messages) => {
        const messageContainer = document.getElementById("message-container");

        // Iterate over the messages and display them on the page
        messages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.innerHTML = `
            <h3>${message.name} (${message.email})</h3>
            <p>Subject: ${message.subject}</p>
            <p>Message: ${message.message}</p>
          `;
          messageContainer.appendChild(messageElement);
        });
      })
      .catch((error) => console.error("Error fetching messages:", error));