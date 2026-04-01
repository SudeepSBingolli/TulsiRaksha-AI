export async function POST(request) {
  try {
    // Clear the user session
    const response = new Response(
      JSON.stringify({ 
        success: true, 
        message: "Logged out successfully" 
      }),
      { 
        status: 200,
        headers: {
          "Set-Cookie": "userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;"
        }
      }
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to logout" }),
      { status: 500 }
    );
  }
}
