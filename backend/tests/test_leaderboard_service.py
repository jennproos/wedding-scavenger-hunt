import json
import pytest
from unittest.mock import patch, MagicMock
from botocore.exceptions import ClientError


def _no_such_key_error():
    return ClientError({"Error": {"Code": "NoSuchKey", "Message": ""}}, "GetObject")


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    monkeypatch.delenv("LEADERBOARD_BUCKET", raising=False)


def test_s3_read_returns_empty_when_object_missing(monkeypatch):
    monkeypatch.setenv("LEADERBOARD_BUCKET", "my-bucket")
    mock_s3 = MagicMock()
    mock_s3.get_object.side_effect = _no_such_key_error()
    with patch("services.leaderboard_service.boto3.client", return_value=mock_s3):
        from services import leaderboard_service
        result = leaderboard_service._read_data()
    assert result == {}


def test_s3_read_returns_data_when_object_exists(monkeypatch):
    monkeypatch.setenv("LEADERBOARD_BUCKET", "my-bucket")
    payload = {"sess-1": {"player_name": "Alice"}}
    mock_body = MagicMock()
    mock_body.read.return_value = json.dumps(payload).encode()
    mock_s3 = MagicMock()
    mock_s3.get_object.return_value = {"Body": mock_body}
    with patch("services.leaderboard_service.boto3.client", return_value=mock_s3):
        from services import leaderboard_service
        result = leaderboard_service._read_data()
    assert result == payload


def test_s3_write_puts_object(monkeypatch):
    monkeypatch.setenv("LEADERBOARD_BUCKET", "my-bucket")
    mock_s3 = MagicMock()
    with patch("services.leaderboard_service.boto3.client", return_value=mock_s3):
        from services import leaderboard_service
        leaderboard_service._write_data({"sess-1": {"player_name": "Bob"}})
    mock_s3.put_object.assert_called_once()
    call_kwargs = mock_s3.put_object.call_args.kwargs
    assert call_kwargs["Bucket"] == "my-bucket"
    assert call_kwargs["Key"] == "leaderboard.json"
    assert "Bob" in call_kwargs["Body"]


def test_s3_clear_deletes_object(monkeypatch):
    monkeypatch.setenv("LEADERBOARD_BUCKET", "my-bucket")
    mock_s3 = MagicMock()
    with patch("services.leaderboard_service.boto3.client", return_value=mock_s3):
        from services import leaderboard_service
        leaderboard_service.clear_all()
    mock_s3.delete_object.assert_called_once_with(Bucket="my-bucket", Key="leaderboard.json")


def test_falls_back_to_file_when_no_bucket_env(tmp_path, monkeypatch):
    """Without LEADERBOARD_BUCKET, reads/writes a local file."""
    from services import leaderboard_service
    monkeypatch.setattr(leaderboard_service, "_LEADERBOARD_PATH", tmp_path / "leaderboard.json")
    leaderboard_service._write_data({"sess-x": {"player_name": "Carol"}})
    result = leaderboard_service._read_data()
    assert result["sess-x"]["player_name"] == "Carol"
