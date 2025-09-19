// fetchUserPostsAndComments.js

/**
 * Obtiene información de un usuario junto con sus publicaciones y comentarios
 * @param {number} userId - ID del usuario a consultar
 * @returns {Object} - Objeto con datos del usuario, publicaciones y comentarios
 */
async function getUserWithPostsAndComments(userId) {
  try {
    // 1. Obtener datos del usuario
    const userResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error(`Error al obtener usuario: ${userResponse.status}`);
    }
    const user = await userResponse.json();

    // 2. Obtener publicaciones del usuario
    const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    if (!postsResponse.ok) {
      throw new Error(`Error al obtener publicaciones: ${postsResponse.status}`);
    }
    const posts = await postsResponse.json();

    // 3. Obtener comentarios para cada publicación
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`);
      
      if (!commentsResponse.ok) {
        throw new Error(`Error al obtener comentarios para el post ${post.id}: ${commentsResponse.status}`);
      }
      
      const comments = await commentsResponse.json();
      
      // Devolver publicación con sus comentarios
      return {
        ...post,
        comments
      };
    }));

    // 4. Retornar objeto con la estructura requerida
    return {
      user,
      posts: postsWithComments
    };

  } catch (error) {
    console.error(`Error en getUserWithPostsAndComments: ${error.message}`);
    throw error; // Relanzar el error para que quien llame a la función pueda manejarlo
  }
}

// Ejemplo de uso:
async function main() {
  try {
    const result = await getUserWithPostsAndComments(1);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
