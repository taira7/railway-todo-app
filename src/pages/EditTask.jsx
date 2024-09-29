import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import axios from "axios";
import { useCookies } from "react-cookie";
import { url } from "../const";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./editTask.scss"; //

export const EditTask = () => {
  const navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState();
  const [errorMessage, setErrorMessage] = useState("");

  const [limit, setLimit] = useState("");
  const [changedLimit, setChangedLimit] = useState("");
  const [formattedLimit, setFormattedLimit] = useState("");

  const [limitYear, setLimitYear] = useState("");
  const [limitMonth, setLimitMonth] = useState("");
  const [limitDate, setLimitDate] = useState("");
  const [limitHour, setLimitHours] = useState("");
  const [limitMinutes, setLimitMinutes] = useState("");

  const [restDays, setRestDays] = useState("");
  const [restHours, setRestHours] = useState("");
  const [restMinutes, setRestMinutes] = useState("");

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");
  const onUpdateTask = () => {
    console.log(isDone);
    const data = {
      title: title,
      detail: detail,
      done: isDone,
      limit: limit,
    };

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  const getLimit = async () => {
    try {
      const res = await fetch(`${url}/lists/${listId}/tasks/${taskId}`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      });
      const data = await res.json();

      if (!data.limit) {
        setLimit("なし");
      } else {
        setLimit(data.limit);
      }
    } catch (error) {
      setErrorMessage(`期限の情報の取得に失敗しました．${error}`);
    }
  };

  const convertToJapanTime = () => {
    //limitを UTC -> JST
    if (limit) {
      const JSTLimitDate = new Date(limit);

      setLimitYear(JSTLimitDate.getFullYear().toString()); //(年)
      setLimitMonth((JSTLimitDate.getMonth() + 1).toString().padStart(2, "0")); // (月)
      setLimitDate(JSTLimitDate.getDate().toString().padStart(2, "0")); // (日)
      setLimitHours(JSTLimitDate.getHours().toString().padStart(2, "0")); // (時)
      setLimitMinutes(JSTLimitDate.getMinutes().toString().padStart(2, "0")); // (分)
    }
  };

  //残りの日時
  const showRestTime = () => {
    if (limit) {
      const now = new Date();
      const IsoLimit = new Date(limit);
      const JSTLimit = IsoLimit.toLocaleString("ja-JP", {
        timeZone: "Asia/Tokyo",
      });
      const timeLimit = new Date(JSTLimit);

      const restMilliSeconds = timeLimit.getTime() - now.getTime();

      const days = Math.floor(restMilliSeconds / 1000 / 24 / 60 / 60);
      const hours = Math.floor(restMilliSeconds / 1000 / 60 / 60) % 24;
      const minutes = Math.floor(restMilliSeconds / 1000 / 60) % 60;

      setRestDays(days);
      setRestHours(hours);
      setRestMinutes(minutes);
    }
  };

  const convertToISO = () => {
    //changedLimitの変換 YYYY-MM-DDTHH:MM -> YYYY-MM-DDTHH:MM:SSZ
    if (changedLimit) {
      const JSTLimit = new Date(changedLimit);
      const ISOLimit = JSTLimit.toISOString();
      const formattedISOLimit = ISOLimit.replace(".000", "");

      // フォーマットを整える
      setFormattedLimit(formattedISOLimit);
    }
  };

  const handleLimitChange = (e) => {
    setChangedLimit(e.target.value);
  };

  const handleLimitSubmit = async () => {
    const data = {
      title: title,
      detail: detail,
      done: isDone,
      limit: formattedLimit,
    };

    try {
      const res = await fetch(`${url}/lists/${listId}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies.token}`,
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      setErrorMessage(`期限の変更に失敗しました．`);
    }

    //変更後に画面を更新するため
    getLimit();
  };

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data;
        setTitle(task.title);
        setDetail(task.detail);
        setIsDone(task.done);
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });

    getLimit();
    // console.log(cookies.token);
  }, []);

  useEffect(() => {
    convertToJapanTime();
    showRestTime();
    // console.log(limit, "limit");
  }, [limit]);

  useEffect(() => {
    //期限の変更時
    convertToISO();
  }, [changedLimit]);

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? "checked" : ""}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? "checked" : ""}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
        <p>
          期限：{limitYear}年{limitMonth}月{limitDate}日{limitHour}時
          {limitMinutes}分
        </p>
        <p>
          残り日時：{restDays}日{restHours}時間{restMinutes}分
        </p>
        <p>期限の設定</p>
        <form onSubmit={handleLimitSubmit}>
          <input
            type="datetime-local"
            value={changedLimit}
            onChange={handleLimitChange}
            className="edit-task-detail"
          ></input>
          <button type="submit" className="edit-task-button">
            変更する
          </button>
        </form>
      </main>
    </div>
  );
};
