import unittest
import requests
import base64

class TestScoreImageEndpoint(unittest.TestCase):
    def test_score_image(self):
        url = "http://localhost:5000/score-image"
        with open('./images/test-happy.webp', 'rb') as image_file:
            image = base64.b64encode(image_file.read()).decode('utf-8')
        response = requests.post(url, json={'image': image})
        self.assertEqual(response.status_code, 200)
        self.assertIn('result', response.json())
        self.assertIn('confidence', response.json()['result'])
        self.assertIsInstance(response.json()['result']['confidence'], float)

    def test_score_image_batch(self):
        url = "http://localhost:5000/score-batch"
        images = []
        for image_path in ['./images/test-happy.webp', './images/test-sad.jpg']:  # Update the paths here
            with open(image_path, 'rb') as image_file:
                image = base64.b64encode(image_file.read()).decode('utf-8')
                images.append(image)
        response = requests.post(url, json={'image': images})
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('result', response.json())
        self.assertIn('average', response.json()['result'])
        self.assertIn('most_prevalent_emotion', response.json()['result'])
        self.assertIsInstance(response.json()['result']['average'], float)
        self.assertIsInstance(response.json()['result']['most_prevalent_emotion'], str)

if __name__ == '__main__':
    unittest.main()