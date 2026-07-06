import axios from './axios'

import type {
  GoalResponseDTO,
  GoalRequestDTO,
  GoalStatusDTO,
  GoalStatus
} from "../types";



export const getGoalsByEmployee = async (employeeId: number) => {
    const { data } = await axios.get<GoalResponseDTO[]>(
        `/goals/employee/${employeeId}`
    )
    return data
}



export const getGoalsByManager = async (managerId: number) => {
    const { data } = await axios.get<GoalResponseDTO[]>(
        `/goals/manager/${managerId}`
    )
    return data
}



export const createGoal = async (goal: GoalRequestDTO) => {
    const { data } = await axios.post<GoalResponseDTO>(
        "/goals",
        goal
    );
    return data;
};



export const submitGoalCompletion = async (
    goalId: number,
    completed: boolean,
    note: string
) => {
    const { data } = await axios.patch<GoalStatusDTO>(
        `/goals/${goalId}/submit`,
        {
            employeeCompleted: completed,
            employeeNote: note
        }
    );
    return data;
};


export const confirmGoalCompletion = async (
    goalId: number,
    status: GoalStatus
) => {
    const { data } = await axios.patch<GoalStatusDTO>(
        `/goals/${goalId}/confirm`,
        {
            status
        }
    );

    return data;
};

export const startGoal = async (goalId: number) => {
    const { data } = await axios.patch<GoalResponseDTO>(`/goals/${goalId}/start`)
    return data
};

export const updateEmployeeNote = async (goalId: number, note: string) => {
    const { data } = await axios.patch<GoalStatusDTO>(
        `/goals/${goalId}/note`,
        null,
        { params: { note } }
    )
    return data
}

export const cancelGoal = async (goalId: number) => {
    const { data } = await axios.patch<GoalResponseDTO>(`/goals/${goalId}/cancel`)
    return data
}