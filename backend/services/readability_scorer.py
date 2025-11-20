"""
Readability Scorer
Uses NLP to score text readability
"""

from typing import Dict, Any
import re


class ReadabilityScorer:
    """Scores text readability using various metrics"""
    
    def __init__(self):
        pass
    
    def score(self, text: str) -> float:
        """
        Calculate Flesch Reading Ease score
        
        Args:
            text: Text to analyze
            
        Returns:
            Flesch Reading Ease score (0-100, higher = easier)
        """
        # Clean text
        text = self._clean_text(text)
        
        if not text:
            return 0.0
        
        # Count sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        sentence_count = len(sentences)
        
        if sentence_count == 0:
            return 0.0
        
        # Count words
        words = text.split()
        word_count = len(words)
        
        if word_count == 0:
            return 0.0
        
        # Count syllables
        total_syllables = sum(self._count_syllables(word) for word in words)
        
        # Calculate Flesch Reading Ease
        # Score = 206.835 - (1.015 * ASL) - (84.6 * ASW)
        # ASL = Average Sentence Length (words per sentence)
        # ASW = Average Syllables per Word
        
        asl = word_count / sentence_count
        asw = total_syllables / word_count
        
        score = 206.835 - (1.015 * asl) - (84.6 * asw)
        
        # Ensure score is within 0-100 range
        score = max(0.0, min(100.0, score))
        
        return round(score, 2)
    
    def _clean_text(self, text: str) -> str:
        """Clean text for analysis"""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:\-\']+', '', text)
        
        return text.strip()
    
    def _count_syllables(self, word: str) -> int:
        """
        Estimate syllable count in a word
        
        Args:
            word: Word to count syllables in
            
        Returns:
            Estimated syllable count
        """
        word = word.lower().strip()
        
        if not word:
            return 1
        
        # Remove trailing 'e'
        if word.endswith('e'):
            word = word[:-1]
        
        # Count vowel groups
        vowels = re.findall(r'[aeiouy]+', word)
        
        if not vowels:
            return 1
        
        # Simple heuristic: each vowel group is roughly a syllable
        syllable_count = len(vowels)
        
        # Adjust for common patterns
        if word.endswith('le') and len(word) > 2:
            syllable_count += 1
        
        # Minimum 1 syllable
        return max(1, syllable_count)
    
    def get_grade_level(self, score: float) -> str:
        """
        Convert Flesch score to grade level
        
        Args:
            score: Flesch Reading Ease score
            
        Returns:
            Grade level description
        """
        if score >= 90:
            return "5th grade"
        elif score >= 80:
            return "6th grade"
        elif score >= 70:
            return "7th grade"
        elif score >= 60:
            return "8th-9th grade"
        elif score >= 50:
            return "10th-12th grade"
        elif score >= 30:
            return "College"
        else:
            return "College graduate"
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive readability analysis
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with readability metrics
        """
        score = self.score(text)
        grade_level = self.get_grade_level(score)
        
        # Additional metrics
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        avg_words_per_sentence = len(words) / len(sentences) if sentences else 0
        avg_chars_per_word = sum(len(word) for word in words) / len(words) if words else 0
        
        return {
            "flesch_reading_ease": score,
            "grade_level": grade_level,
            "word_count": len(words),
            "sentence_count": len(sentences),
            "average_words_per_sentence": round(avg_words_per_sentence, 2),
            "average_characters_per_word": round(avg_chars_per_word, 2),
            "recommendation": self._get_recommendation(score)
        }
    
    def _get_recommendation(self, score: float) -> str:
        """Get readability recommendation"""
        if score >= 70:
            return "Text is easily readable for most audiences."
        elif score >= 50:
            return "Text is fairly readable but could be simplified for broader audience."
        else:
            return "Text is difficult to read. Consider simplifying language and sentence structure."

