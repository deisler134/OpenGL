#version 330 core

struct Material {
	sampler2D diffuse;
    sampler2D specular;
    float     shininess;
}; 

struct Light {
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};


in vec3 FragPos;  
in vec3 Normal; 
in vec2 TexCoords; 
  
out vec4 color;
  
uniform vec3 viewPos;
uniform Material material;
uniform Light light;
uniform sampler2D matrix;


struct DirLight {
    vec3 direction;
	
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
}; 
uniform DirLight dirLight;
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);  

struct PointLight {    
    vec3 position;
    
    float constant;
    float linear;
    float quadratic;  

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  
#define NR_POINT_LIGHTS 4  
uniform PointLight pointLights[NR_POINT_LIGHTS];
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

struct SpotLight{
	vec3 position;
	vec3 direction;
	float cutOff;
	float outerCutOff;

    float constant;
    float linear;
    float quadratic;
  
    vec3 ambient;
    vec3 diffuse;
    vec3 specular; 
};
uniform SpotLight spotLight;
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{
    // Properties
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);
	    
    // ========================================
    // Our lighting is set up in 3 phases: directional, point lights and an optional flashlight
    // For each phase, a calculate function is defined that calculates the corresponding color
    // per lamp. In the main() function we take all the calculated colors and sum them up for
    // this fragment's final color.
    // ========================================
    // Phase 1: Directional lighting
	//vec3 result = CalcDirLight(dirLight, norm, viewDir);
		 vec3 lightDir = normalize(-dirLight.direction);
		// Diffuse shading
		float diff = max(dot(norm, lightDir), 0.0);
		// Specular shading
		vec3 reflectDir = reflect(-lightDir, norm);
		float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
		// Combine results
		vec3 ambient  = dirLight.ambient  * vec3(texture(material.diffuse, TexCoords));
		vec3 diffuse  = dirLight.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
		vec3 specular = dirLight.specular * spec * vec3(texture(material.specular, TexCoords));
		vec3 result = (ambient + diffuse + specular);
    // Phase 2: Point lights
	vec3 result2;
	for(int i = 0; i < NR_POINT_LIGHTS; i++)
	{
		 lightDir = normalize(pointLights[i].position - FragPos);
		// Diffuse shading
		diff = max(dot(norm, lightDir), 0.0);
		// Specular shading
		reflectDir = reflect(-lightDir, norm);
		spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
		// Attenuation
		float distance    = length(pointLights[i].position - FragPos);
		float attenuation = 1.0f / (pointLights[i].constant + pointLights[i].linear * distance + 
  			     pointLights[i].quadratic * (distance * distance));    
		// Combine results
		ambient  = pointLights[i].ambient  * vec3(texture(material.diffuse, TexCoords));
		diffuse  = pointLights[i].diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
		specular = pointLights[i].specular * spec * vec3(texture(material.specular, TexCoords));
		ambient  *= attenuation;
		diffuse  *= attenuation;
		specular *= attenuation;
		result += (ambient + diffuse + specular);
	}
	//	vec3 result = CalcPointLight(pointLights[i], norm, FragPos, viewDir);    
    // Phase 3: Spot light
	    lightDir = normalize(spotLight.position - FragPos);
		 // Diffuse shading
		diff = max(dot(norm, lightDir), 0.0);
		// Specular shading
		reflectDir = reflect(-lightDir, norm);
		spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
		// Spotlight (soft edges)
		float theta = dot(lightDir, normalize(-spotLight.direction)); 
		float epsilon = (spotLight.cutOff - spotLight.outerCutOff);
		float intensity = clamp((theta - spotLight.outerCutOff) / epsilon, 0.0, 1.0);

		// Attenuation
		float distance    = length(spotLight.position - FragPos);
		float attenuation = 1.0f / (spotLight.constant + spotLight.linear * distance + 
  			     spotLight.quadratic * (distance * distance));    
		// Combine results
		ambient  = spotLight.ambient  * vec3(texture(material.diffuse, TexCoords));
		diffuse  = spotLight.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
		specular = spotLight.specular * spec * vec3(texture(material.specular, TexCoords));
		diffuse  *= intensity;
		specular *= intensity;
		ambient  *= attenuation;
		diffuse  *= attenuation;
		specular *= attenuation;
		result += (ambient + diffuse + specular);
	//result = CalcSpotLight(spotLight, norm, FragPos, viewDir);    


	// Moving Caster light
	// Ambient
    ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
  	
    // Diffuse 
    norm = normalize(Normal);
    lightDir = normalize(-light.direction);
    diff = max(dot(norm, lightDir), 0.0);
    diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords));  
    
    // Specular
    //vec3 viewDir = normalize(viewPos - FragPos);
    reflectDir = reflect(-lightDir, norm);  
    spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    specular = light.specular * spec * vec3(texture(material.specular, TexCoords)  + texture(matrix, TexCoords));
    result += ambient + diffuse + specular;
    //color = vec4(result, 1.0f);
	//color = texture(material.diffuse, TexCoords)+ texture(material.specular, TexCoords);	
/**/    
    color = vec4(result, 1.0);

} 
// Calculates direction light
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir)
{
    vec3 lightDir = normalize(-light.direction);
    // Diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // Specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // Combine results
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
    return (ambient + diffuse + specular);
}

// Calculates the color when using a point light.
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);
    // Diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // Specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // Attenuation
    float distance    = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + 
  			     light.quadratic * (distance * distance));    
    // Combine results
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
} 
  
// Calculates spotlight.
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);
    // Diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // Specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	// Spotlight (soft edges)
    float theta = dot(lightDir, normalize(-light.direction)); 
    float epsilon = (light.cutOff - light.outerCutOff);
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    // Attenuation
    float distance    = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + 
  			     light.quadratic * (distance * distance));    
    // Combine results
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
	diffuse  *= intensity;
    specular *= intensity;
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}