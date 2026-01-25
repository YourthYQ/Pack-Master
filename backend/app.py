from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from algorithms.ga import run_brkga
from algorithms.box import Box
import json
from scaling import import_box_data, format_pallet_unit
from algorithms.placement import get_box_dimensions

app = Flask(__name__)
CORS(app)

ALLOWED_EXTENSIONS = {"xlsx"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def err(message, code=None):
    out = {"error": message}
    if code:
        out["code"] = code
    return out

@app.route("/palletize", methods=["POST"])
def palletize():
    boxes = None
    pallet_dims = None
    scale_ratio = None

    if "file" in request.files:
        file = request.files["file"]
        if not file or not allowed_file(file.filename):
            return jsonify(err("Invalid file. Please upload an XLSX file.", "INVALID_FILE")), 400
        if "pallet_dims" not in request.form:
            return jsonify(err("Missing pallet_dims in form.", "MISSING_PALLET_DIMS")), 400
        try:
            pallet_dims = json.loads(request.form["pallet_dims"])
            pallet_dims = [float(pallet_dims["length"]), float(pallet_dims["width"]), float(pallet_dims["height"])]
        except (json.JSONDecodeError, KeyError, ValueError, TypeError):
            return jsonify(err("Invalid pallet_dims. Need {length, width, height}.", "INVALID_PALLET_DIMS")), 400
        try:
            boxes, scale_ratio = import_box_data(file, pallet_dims)
        except Exception:
            return jsonify(err(
                "Failed to parse Excel file. Use the expected sheet/columns (see README).",
                "FILE_PARSE_ERROR"
            )), 400
    else:
        try:
            data = request.get_json(silent=True) or {}
            boxes = data["boxes"]
            pallet_dims = data["pallet_dims"]
            pallet_dims = [float(pallet_dims[0]), float(pallet_dims[1]), float(pallet_dims[2])]
            scale_ratio = 1
        except (KeyError, ValueError, TypeError, IndexError):
            return jsonify(err("Invalid JSON. Need { boxes: [{length, width, height}, ...], pallet_dims: [L,W,H] }.", "INVALID_INPUT")), 400

    if boxes is None or (isinstance(boxes, list) and len(boxes) == 0):
        return jsonify(err("No boxes provided.", "NO_BOXES")), 400

    # Build box_objects: from Box instances (file) or dicts (manual)
    try:
        box_objects = [Box(i + 1, box.length, box.width, box.height) for i, box in enumerate(boxes)]
    except:
        box_objects = [Box(i + 1, box["length"], box["width"], box["height"]) for i, box in enumerate(boxes)]

    # Format the pallet dimensions using scaling ratio
    pallet_dims = (
        format_pallet_unit(pallet_dims[0], scale_ratio),
        format_pallet_unit(pallet_dims[1], scale_ratio),
        format_pallet_unit(pallet_dims[2], scale_ratio)
    )

    best_solutions = []
    # Run the genetic algorithm or placement logic
    best_solution, remaining_boxes = run_brkga(
        population_size=4,  # 4
        boxes=box_objects,
        pallet_dims=pallet_dims,
        max_generations=2,  # 2
        mutation_rate=0.07
    )
    best_solutions.append(best_solution)

    # Continue running the algorithm for remaining boxes
    while remaining_boxes:
        best_solution, remaining_boxes = run_brkga(
            population_size=4,
            boxes=remaining_boxes,
            pallet_dims=pallet_dims,
            max_generations=2,
            mutation_rate=0.07
        )
        best_solutions.append(best_solution)

    # Prepare a list of solutions, where each solution contains multiple boxes with their dimensions
    all_solutions_with_dims = []

    # Nested loop to iterate over all solutions
    for solution in best_solutions:
        pallet_solution_with_dims = []
        for box, position, orientation in solution:
            length, width, height = get_box_dimensions(box, orientation)
            pallet_solution_with_dims.append({
                "id": box.box_id,               
                "position": position,          
                "orientation": orientation,     
                "length": length,           
                "width": width,             
                "height": height            
            })
        all_solutions_with_dims.append(pallet_solution_with_dims)

    return jsonify({
        "pallet_dims": pallet_dims,
        "best_solutions": all_solutions_with_dims  # Now returning multiple pallet solutions
    })

if __name__ == '__main__':
    app.run(debug=True)