package com.projetpfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.projetpfe.service.ImageGenerationService;

@RestController
@RequestMapping("/image")
public class ImageGenerationController {

    @Autowired
    private ImageGenerationService imageGenerationService;

    @PostMapping("/generate")
    public String generateImage(@RequestBody String prompt) {
        return imageGenerationService.generateImage(prompt);
    }
}
