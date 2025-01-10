package com.app.focus.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class mainController {
    
    @GetMapping("/")
    public String redirectToMain() {
        return "redirect:/mainPage";
    }

    @GetMapping("/mainPage")
    public String mainPage() {
        return "mainPage";
    }
}
