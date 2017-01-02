#version 330 core
out vec4 color;
  
in vec3 Normal;  
in vec3 FragPos; 
 
in vec3 lightPosview;		// view space:Extra in variable, since we need the light position in view space we calculate this in the vertex shader
  
uniform vec3 lightPos; 
uniform vec3 lightColor;
uniform vec3 objectColor;
uniform vec3 viewPos;

void main()
{
    // Ambient
    float ambientStrength = 0.1f;
    vec3 ambient = ambientStrength * lightColor;

    // Diffuse 
    vec3 norm = normalize(Normal);
    //vec3 lightDir = normalize(lightPos - FragPos);
	vec3 lightDir = normalize(lightPosview - FragPos);			// view space: 
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

	//Specular
	float specularStrength = 0.5f;
	//vec3 viewDir = normalize(viewPos - FragPos);
	vec3 viewDir = normalize(- FragPos);				// view space:The viewer is at (0,0,0) so viewDir is (0,0,0) - Position => -Position
	vec3 reflectDir = reflect(-lightDir, norm);  
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
	vec3 specular = specularStrength * spec * lightColor;  

    vec3 result = (ambient + diffuse + specular) * objectColor;
	color = vec4(result, 1.0f);
} 