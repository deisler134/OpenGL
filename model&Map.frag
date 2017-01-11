#version 330 core

in vec2 TexCoords;

//Reflection
in vec3 Normal;
in vec3 Position;
uniform vec3 cameraPos;
uniform samplerCube skybox;

out vec4 color;

uniform sampler2D texture_diffuse1;

void main()
{    
	//color = vec4(texture(texture_diffuse1, TexCoords));

	////Reflection        
    vec3 I = normalize(Position - cameraPos);
    vec3 R = reflect(I, normalize(Normal));
    color = texture(skybox, R);
}