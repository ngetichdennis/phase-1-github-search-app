document.addEventListener('DOMContentLoaded', () => {
  const githubForm = document.getElementById('github-form');
  const searchInput = document.getElementById('search');
  const userList = document.getElementById('user-list');
  const reposList = document.getElementById('repos-list');

  githubForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    if (searchTerm === '') {
      alert('Please enter a GitHub username.');
      return;
    }

    try {
      // Search for users using the User Search Endpoint
      const userSearchResponse = await searchUsers(searchTerm);

      // Display user names in a list
      displayUserNames(userSearchResponse.username);

      // Attach click event to each user for fetching and displaying details
      attachUserClickEvent();
    } catch (error) {
      console.error('Error searching for users:', error.message);
      alert('Error searching for users. Please try again.');
    }
  });

  async function searchUsers(username) {
    // Use backticks to create template literals
    const apiUrl = `https://api.github.com/search/users?q=${username}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('GitHub API error:' `${response.statusText}`);
    }

    return response.json();
  }

  function displayUserNames(users) {
    // Clear previous search results
    userList.innerHTML = '';
    reposList.innerHTML = '';

    // Display user names in a list
    users.forEach(user => {
      const listItem = document.createElement('li');
      listItem.textContent = user.login;
      listItem.classList.add('user-name');
      listItem.dataset.username = user.login;
      userList.appendChild(listItem);
    });
  }

  function displayUserProfile(user) {
    // Clear previous user profile information
    reposList.innerHTML = '';

    // Display user profile information
    const userProfile = document.createElement('div');
    userProfile.innerHTML = `
      <img src='${user.avatar_url}' alt='${user.login}' />
      <h2>${user.login}</h2>
      <p>Bio: ${user.bio || 'Not available'}</p>
      <p>Location: ${user.location || 'Not available'}</p>
      <p>Followers: ${user.followers}</p>
      <h3>Repositories:</h3>
      <ul id="user-repos-list"></ul>
    `;
    reposList.appendChild(userProfile);

    // Fetch and display user repositories
    getUserRepos(user.login)
      .then(repos => displayRepos(repos, 'user-repos-list'))
      .catch(error => {
        console.error('Error fetching user repositories:', error.message);
        alert('Error fetching user repositories. Please try again.');
      });
  }

  function attachUserClickEvent() {
    const userItems = document.querySelectorAll('#user-list .user-name');

    userItems.forEach(item => {
      item.addEventListener('click', async () => {
        const username = item.dataset.username;
        try {
          // Fetch user details using the User Details Endpoint
          const userDetails = await getUserDetails(username);

          // Hide other user names and display the profile of the clicked user
          userItems.forEach(userItem => {
            userItem.style.display = 'none';
          });

          displayUserProfile(userDetails);
        } catch (error) {
          console.error('Error fetching user details:', error.message);
          alert('Error fetching user details. Please try again.');
        }
      });
    });
  }

  async function getUserDetails(username) {
    // Use backticks to create template literals
    const userUrl = `https://api.github.com/users/${username}`;
    const response = await fetch(userUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('GitHub API error:' `${response.statusText}`);
    }

    return response.json();
  }

  async function getUserRepos(username) {
    // Use backticks to create template literals
    const reposUrl = `https://api.github.com/users/${username}/repos`;
    const response = await fetch(reposUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('GitHub API error:' `${response.statusText}`);
    }

    return response.json();
  }

  function displayRepos(repos, elementId) {
    // Get the element by id
    const reposList = document.getElementById(elementId);

    // Loop through the repos array
    repos.forEach(repo => {
      // Create a list item for each repo
      const listItem = document.createElement('li');

      // Create a link element for each repo
      const link = document.createElement('a');
      link.href = repo.html_url;
      link.textContent = repo.name;

      // Append the link to the list item
      listItem.appendChild(link);

      // Append the list item to the repos list
      reposList.appendChild(listItem);
    });
  }

  // Call the getUserRepos function with a valid username
  getUserRepos(username);
});