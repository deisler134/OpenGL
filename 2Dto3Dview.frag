#version 330 core
in vec3 ourColor;
in vec2 TexCoord;

out vec4 color;

// set two textures
uniform sampler2D ourTexture;
uniform sampler2D ourTexture2;

// set mix value
uniform float fMixRatio;

void main()
{
	// chang direction of texture2
   // color =mix( texture(ourTexture, TexCoord), texture(ourTexture2, vec2( 1.0f - TexCoord.y, 1.0f - TexCoord.x )), 0.2) * vec4( ourColor, 1.0f );
	
	// set mix ratio value
	color =mix( texture(ourTexture, TexCoord), texture(ourTexture2, TexCoord), fMixRatio) * vec4( ourColor, 1.0f );   
}