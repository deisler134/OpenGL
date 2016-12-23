#pragma once

#ifndef SHADER_H
#define SHADER_H

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>

#include <GL/glew.h>

class Shader
{
public:
	Shader(void);
	~Shader(void);
	Shader(const GLchar* vertexPath, const GLchar* fragmentPath);		// Constructor generates the shader on the fly
	void Use();															// Uses the current shader

	GLuint Program;
};

#endif

