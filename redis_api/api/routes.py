import json

from flask import Blueprint, jsonify

from api.errors import empty_response, error_response
from redis import RedisError, StrictRedis
from api.tests.unit import fake_data

redis_bp = Blueprint("redis_bp", "redis_api", url_prefix="/open-disclosure/api/v1.0")
r = StrictRedis(host="localhost", port=6379)


@redis_bp.route("/", methods=["GET"])
def home():
    return f"<h1>Welcome to the Open Disclosure API</p>"


@redis_bp.route("/total-contributions", methods=["GET"])
def get_total_contributions(serve_fake=True):
    """
    Query redis to get the total amount of monies spent
    :return: int representing the total for (either all time or current election)
    """
    if serve_fake:
        return jsonify({"TotalContributions": 100000})
    try:
        response = r.execute_command("JSON.GET", "TotalContributions")
        if not response:
            return empty_response("TotalContributions")
        return jsonify({"TotalContributions": json.loads(response)})
    except Exception as error:
        return error_response(f"{error}")


@redis_bp.route("/candidates/", defaults={"candidate_id": None}, methods=["GET"])
@redis_bp.route("/candidates/<string:candidate_id>", methods=["GET"])
def get_candidates(candidate_id, serve_fake=False):
    """
    Get all the candidates from the current election period or
    a specific candidate 
    :param candidate_id: unique identifier associated with each candidate {election-title;cand-name;election-date} 
    :type candidate_id: string
    :return: data on all candidates or for one specific candidate
    :rtype: JSON
    """
    if serve_fake:
        return fake_data.get_candidates_shape()
    try:
        response = r.execute_command("JSON.GET", "Candidates")
        if not response:
            return empty_response("Candidates")
        cand_json = json.loads(response)
        if candidate_id is None:
            return jsonify({"Candidates": cand_json})
        else:
            for candidate in cand_json:
                if candidate["ID"] == candidate_id:
                    return candidate
            return empty_response(candidate_id)
    except Exception as error:
        return error_response(f"{error}")


@redis_bp.route("/committees/", methods=["GET"])
def get_committees(serve_fake=True):
    """
    Get all the committees from the current election period
    :return: list or set of JSON objects containing individual candidate information
    """
    if serve_fake:
        return jsonify({"Committees": fake_data.get_committees_shape()})
    try:
        response = r.execute_command("JSON.GET", "Committees")
        if not response:
            return empty_response("Committees")
        return jsonify({"Committees": json.loads(response)})
    except Exception as error:
        return error_response(f"{error}")


@redis_bp.route("/elections/", methods=["GET"])
def get_elections(serve_fake=True):
    """
    Get all the election cycles from 2019-2020
    :return: list or set of JSON objects containing individual election cycle information
    """
    if serve_fake:
        return jsonify({"Elections": fake_data.get_elections_shape()})
    try:
        response = r.execute_command("JSON.GET", "Elections")
        if not response:
            return empty_response("Elections")
        return jsonify({"Elections": json.loads(response)})
    except Exception as error:
        return error_response(f"{error}")


@redis_bp.route("/referendums", methods=["GET"])
def get_referendums(serve_fake=True):
    """
    WIP
    :return:
    """
    if serve_fake:
        return fake_data.get_referendums_shape()
    return empty_response("Referendums")


@redis_bp.route("/metadata", methods=["GET"])
def get_metadata(serve_fake=True):
    """
    WIP
    :return:
    """
    if serve_fake:
        return fake_data.get_metadata_shape()
    return empty_response("Metadata")