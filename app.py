from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')

@app.route('/generate_code', methods=['POST'])
def generate_code():
    """Генерация Python кода для tkinter на основе макета"""
    try:
        widgets_data = request.json.get('widgets', [])
        code = generate_tkinter_code(widgets_data)
        return jsonify({'success': True, 'code': code})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

def generate_tkinter_code(widgets):
    """Генерация Python кода с использованием tkinter"""
    
    code = """import tkinter as tk
from tkinter import ttk

class Application:
    def __init__(self, root):
        self.root = root
        self.root.title("Generated Application")
        
"""
    
    # Генерируем код для каждого виджета
    for i, widget in enumerate(widgets):
        widget_type = widget['type']
        widget_id = f"widget_{i}"
        props = widget['properties']
        
        # Получаем координаты
        x = props.get('x', 50)
        y = props.get('y', 50)
        width = props.get('width', 100)
        height = props.get('height', 30)
        
        # Создаем виджет
        if widget_type == 'Button':
            code += f"        self.{widget_id} = tk.Button(root, text='{props.get('text', 'Button')}')\n"
            if 'bg' in props:
                code += f"        self.{widget_id}.configure(bg='{props.get('bg')}')\n"
            if 'fg' in props:
                code += f"        self.{widget_id}.configure(fg='{props.get('fg')}')\n"
            if 'font' in props:
                code += f"        self.{widget_id}.configure(font=('{props.get('font')}', {props.get('font_size', 10)}))\n"
        
        elif widget_type == 'Label':
            code += f"        self.{widget_id} = tk.Label(root, text='{props.get('text', 'Label')}')\n"
            if 'bg' in props:
                code += f"        self.{widget_id}.configure(bg='{props.get('bg')}')\n"
            if 'fg' in props:
                code += f"        self.{widget_id}.configure(fg='{props.get('fg')}')\n"
        
        elif widget_type == 'Entry':
            code += f"        self.{widget_id} = tk.Entry(root)\n"
            if 'bg' in props:
                code += f"        self.{widget_id}.configure(bg='{props.get('bg')}')\n"
            if 'fg' in props:
                code += f"        self.{widget_id}.configure(fg='{props.get('fg')}')\n"
        
        elif widget_type == 'Frame':
            code += f"        self.{widget_id} = tk.Frame(root, width={width}, height={height})\n"
            if 'bg' in props:
                code += f"        self.{widget_id}.configure(bg='{props.get('bg')}')\n"
        
        elif widget_type == 'Canvas':
            code += f"        self.{widget_id} = tk.Canvas(root, width={width}, height={height})\n"
            if 'bg' in props:
                code += f"        self.{widget_id}.configure(bg='{props.get('bg')}')\n"
        
        elif widget_type == 'Listbox':
            code += f"        self.{widget_id} = tk.Listbox(root, width={width//10}, height={height//20})\n"
        
        elif widget_type == 'Checkbutton':
            code += f"        self.{widget_id} = tk.Checkbutton(root, text='{props.get('text', 'Check')}')\n"
            if 'bg' in props:
                code += f"        self.{widget_id}.configure(bg='{props.get('bg')}')\n"
        
        elif widget_type == 'Radiobutton':
            code += f"        self.{widget_id} = tk.Radiobutton(root, text='{props.get('text', 'Radio')}', value=1)\n"
            if 'bg' in props:
                code += f"        self.{widget_id}.configure(bg='{props.get('bg')}')\n"
        
        # Размещаем виджет
        code += f"        self.{widget_id}.place(x={x}, y={y}, width={width}, height={height})\n\n"
    
    # Добавляем запуск приложения
    code += """
if __name__ == "__main__":
    root = tk.Tk()
    app = Application(root)
    root.mainloop()
"""
    
    return code

if __name__ == '__main__':
    app.run(debug=True, port=5000)
